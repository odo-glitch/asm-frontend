import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface GoogleBusinessProfile {
  name: string;
  locationId: string;
  accountId: string;
  address?: string;
  phoneNumber?: string;
}

interface GoogleBusinessSelectorProps {
  userId: string;
  onComplete: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoogleBusinessSelector({
  userId,
  onComplete,
  open,
  onOpenChange,
}: GoogleBusinessSelectorProps) {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<GoogleBusinessProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/google-business/profiles/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch profiles:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to fetch profiles');
      }
      
      const data = await response.json();
      setProfiles(data.profiles);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch business profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSelection = async () => {
    if (!selectedProfile) return;

    const profile = profiles.find(p => p.locationId === selectedProfile);
    if (!profile) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/google-business/select-profile/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: profile.locationId,
          accountId: profile.accountId,
          profileName: profile.name,
        }),
      });

      if (!response.ok) throw new Error('Failed to save profile selection');

      toast({
        title: "Success",
        description: "Business profile connected successfully!",
      });

      onComplete();
    } catch (error) {
      console.error('Error saving profile selection:', error);
      toast({
        title: "Error",
        description: "Failed to save profile selection. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Business Profile</DialogTitle>
          <DialogDescription>
            Choose the Google Business Profile you want to connect to your account.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Fetching your profiles...</span>
          </div>
        ) : (
          <div className="py-4">
            {profiles.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No business profiles found. Make sure you have access to at least one Google Business Profile.
              </p>
            ) : (
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a business profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.locationId} value={profile.locationId}>
                      <div>
                        <div className="font-medium">{profile.name}</div>
                        {profile.address && (
                          <div className="text-sm text-muted-foreground">
                            {profile.address}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={loading || !selectedProfile}
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
