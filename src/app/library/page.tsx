'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Card } from '@/components/ui/card'
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts'
import { 
  ContentItem,
  fetchContentItems,
  fetchContentFolders,
  uploadContent,
  deleteContentItem,
  getCanvaAuthUrl,
  getDropboxAuthUrl
} from '@/lib/content-library'
import { 
  Upload, 
  Link2, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Search,
  Grid,
  List,
  Download,
  Trash2,
  FolderPlus,
  Plus,
  Globe,
  Lock,
  X
} from 'lucide-react'

interface ContentLibraryState {
  items: ContentItem[]
  folders: string[]
  selectedFolder: string | null
  searchQuery: string
  filterType: 'all' | 'image' | 'video' | 'document'
  viewMode: 'grid' | 'list'
}

interface UploadModalState {
  isOpen: boolean
  visibility: 'organization' | 'all_organizations'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function ContentTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'image':
      return <ImageIcon className="w-5 h-5" />
    case 'video':
      return <Video className="w-5 h-5" />
    case 'document':
      return <FileText className="w-5 h-5" />
    default:
      return <FileText className="w-5 h-5" />
  }
}

export default function LibraryPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [, setIsLoading] = useState(true) // isLoading - will be used for loading state
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(() => 
    typeof window !== 'undefined' ? localStorage.getItem('selectedOrgId') : null
  )
  const [uploadModal, setUploadModal] = useState<UploadModalState>({
    isOpen: false,
    visibility: 'organization'
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  const [library, setLibrary] = useState<ContentLibraryState>({
    items: [],
    folders: ['Marketing', 'Product Images', 'Videos', 'Templates'],
    selectedFolder: null,
    searchQuery: '',
    filterType: 'all',
    viewMode: 'grid'
  })

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [fetchedAccounts, items, folders] = await Promise.all([
          fetchUserSocialAccounts(),
          fetchContentItems(selectedOrgId),
          fetchContentFolders(selectedOrgId)
        ])
        
        setAccounts(fetchedAccounts)
        setLibrary(prev => ({
          ...prev,
          items,
          folders: [...prev.folders, ...folders.map(f => f.name)]
        }))
      } catch (error) {
        console.error('Failed to load library:', error)
        // If no data, use mock data as fallback
        setLibrary(prev => ({
          ...prev,
          items: generateMockLibraryItems()
        }))
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedOrgId])

  const generateMockLibraryItems = (): ContentItem[] => {
    const userId = 'mock-user-id' // This will be replaced with real user ID from session
    const now = new Date().toISOString()
    
    return [
      {
        id: '1',
        user_id: userId,
        type: 'image',
        name: 'Product Launch Banner.png',
        url: '/placeholder-image.jpg',
        thumbnail_url: '/placeholder-image.jpg',
        size: 2456789,
        created_at: now,
        updated_at: now,
        source: 'canva',
        tags: ['marketing', 'launch', 'banner'],
        folder: 'Marketing'
      },
      {
        id: '2',
        user_id: userId,
        type: 'video',
        name: 'Tutorial Video.mp4',
        url: '/placeholder-video.mp4',
        size: 15678900,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        source: 'upload',
        tags: ['tutorial', 'education'],
        folder: 'Videos'
      },
      {
        id: '3',
        user_id: userId,
        type: 'document',
        name: 'Content Calendar Template.pdf',
        url: '/placeholder-doc.pdf',
        size: 567890,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
        source: 'dropbox',
        tags: ['template', 'planning'],
        folder: 'Templates'
      }
    ]
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setIsLoading(true)
    try {
      const uploadPromises = Array.from(files).map(file => 
        uploadContent(
          file, 
          library.selectedFolder || 'Uploads', 
          [], 
          'upload',
          selectedOrgId,
          uploadModal.visibility
        )
      )
      
      const newItems = await Promise.all(uploadPromises)
      
      // Add new items to the library
      setLibrary(prev => ({
        ...prev,
        items: [...newItems, ...prev.items]
      }))
      
      // Reset file input and close modal
      event.target.value = ''
      setUploadModal({ isOpen: false, visibility: 'organization' })
    } catch (error) {
      console.error('Failed to upload files:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCanvaImport = () => {
    // Open Canva OAuth flow
    const canvaUrl = getCanvaAuthUrl()
    window.location.href = canvaUrl
  }

  const handleDropboxLink = () => {
    // Open Dropbox OAuth flow
    const dropboxUrl = getDropboxAuthUrl()
    window.location.href = dropboxUrl
  }

  const handleDeleteContent = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return
    }

    try {
      await deleteContentItem(itemId)
      
      // Remove item from the library state
      setLibrary(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }))
      
      alert('Content deleted successfully!')
    } catch (error) {
      console.error('Failed to delete content:', error)
      alert('Failed to delete content. Please try again.')
    }
  }

  const filteredItems = library.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(library.searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(library.searchQuery.toLowerCase()))
    const matchesType = library.filterType === 'all' || item.type === library.filterType
    const matchesFolder = !library.selectedFolder || item.folder === library.selectedFolder
    
    return matchesSearch && matchesType && matchesFolder
  })

  return (
    <AppLayout>
      <Sidebar 
        accounts={accounts} 
        onCreatePost={() => router.push('/create-post')}
      />
      
      <div className="ml-64">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Content Library</h1>
            <div className="flex gap-3">
              <button
                onClick={handleCanvaImport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ImageIcon className="w-4 h-4" />
                Import from Canva
              </button>
              <button
                onClick={handleDropboxLink}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Link2 className="w-4 h-4" />
                Link Dropbox
              </button>
              <button
                onClick={() => setUploadModal({ isOpen: true, visibility: 'organization' })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                Upload Content
              </button>
              <button
                onClick={() => router.push('/create-post')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Create Post
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4 ">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or tags..."
                  value={library.searchQuery}
                  onChange={(e) => setLibrary(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filter by type */}
              <select
                value={library.filterType}
                onChange={(e) => setLibrary(prev => ({ ...prev, filterType: e.target.value as 'all' | 'image' | 'video' | 'document' }))}
                className="px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
              </select>

              {/* View mode */}
              <div className="flex border border-blue-200 rounded-lg">
                <button
                  onClick={() => setLibrary(prev => ({ ...prev, viewMode: 'grid' }))}
                  className={`p-2 ${library.viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLibrary(prev => ({ ...prev, viewMode: 'list' }))}
                  className={`p-2 ${library.viewMode === 'list' ? 'bg-gray-100' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>

          <div className="flex gap-6">
            {/* Folders Sidebar */}
            <Card className="w-64 p-4">
              <div className="space-y-2">
                <h3 className="font-semibold mb-3">Folders</h3>
                <button
                  onClick={() => setLibrary(prev => ({ ...prev, selectedFolder: null }))}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 ${
                    library.selectedFolder === null ? 'bg-gray-100' : ''
                  }`}
                >
                  All Files
                </button>
                {library.folders.map(folder => (
                  <button
                    key={folder}
                    onClick={() => setLibrary(prev => ({ ...prev, selectedFolder: folder }))}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 ${
                      library.selectedFolder === folder ? 'bg-gray-100' : ''
                    }`}
                  >
                    {folder}
                  </button>
                ))}
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-600">
                  <FolderPlus className="w-4 h-4" />
                  New Folder
                </button>
              </div>
            </Card>

            {/* Content Grid/List */}
            <div className="flex-1">
              {library.viewMode === 'grid' ? (
                <div className="grid grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        {item.type === 'image' && item.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.thumbnail_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : item.type === 'video' && item.url ? (
                          <video 
                            src={item.url} 
                            className="w-full h-full object-cover rounded-lg"
                            muted
                            playsInline
                          />
                        ) : (
                          <ContentTypeIcon type={item.type} />
                        )}
                        {/* Visibility Badge */}
                        {item.visibility && (
                          <div className="absolute top-2 right-2">
                            {item.visibility === 'all_organizations' ? (
                              <div className="bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                                <Globe className="w-3 h-3" />
                                <span>Shared</span>
                              </div>
                            ) : (
                              <div className="bg-gray-700 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                                <Lock className="w-3 h-3" />
                                <span>Private</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                        <span>{formatFileSize(item.size)}</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {item.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">{item.source}</span>
                        <div className="flex gap-1">
                          <a 
                            href={item.url} 
                            download={item.name}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => handleDeleteContent(item.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-0">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-4">Name</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Size</th>
                        <th className="text-left p-4">Uploaded</th>
                        <th className="text-left p-4">Source</th>
                        <th className="text-left p-4">Visibility</th>
                        <th className="text-right p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 flex items-center gap-3">
                            <ContentTypeIcon type={item.type} />
                            <span>{item.name}</span>
                          </td>
                          <td className="p-4">{item.type}</td>
                          <td className="p-4">{formatFileSize(item.size)}</td>
                          <td className="p-4">{new Date(item.created_at).toLocaleDateString()}</td>
                          <td className="p-4">{item.source}</td>
                          <td className="p-4">
                            {item.visibility === 'all_organizations' ? (
                              <div className="inline-flex items-center gap-1 text-xs text-blue-600">
                                <Globe className="w-3 h-3" />
                                <span>Shared</span>
                              </div>
                            ) : item.visibility === 'organization' ? (
                              <div className="inline-flex items-center gap-1 text-xs text-gray-600">
                                <Lock className="w-3 h-3" />
                                <span>Private</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1 justify-end">
                              <a 
                                href={item.url} 
                                download={item.name}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              <button 
                                onClick={() => handleDeleteContent(item.id)}
                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {uploadModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Upload Content</h2>
                <button
                  onClick={() => setUploadModal({ isOpen: false, visibility: 'organization' })}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Visibility Option */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="visibility"
                        checked={uploadModal.visibility === 'organization'}
                        onChange={() => setUploadModal(prev => ({ ...prev, visibility: 'organization' }))}
                        className="w-4 h-4"
                      />
                      <Lock className="w-4 h-4 text-gray-600" />
                      <div className="flex-1">
                        <div className="font-medium">This Organization Only</div>
                        <div className="text-xs text-gray-500">
                          Content will only be visible to members of this organization
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="visibility"
                        checked={uploadModal.visibility === 'all_organizations'}
                        onChange={() => setUploadModal(prev => ({ ...prev, visibility: 'all_organizations' }))}
                        className="w-4 h-4"
                      />
                      <Globe className="w-4 h-4 text-gray-600" />
                      <div className="flex-1">
                        <div className="font-medium">All My Organizations</div>
                        <div className="text-xs text-gray-500">
                          Content will be visible across all organizations you belong to
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choose Files to Upload</span>
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: Images, Videos, PDF, Word Documents
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}