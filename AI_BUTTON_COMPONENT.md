# AI Button Component 🤖✨

A stunning, reusable AI-powered button component with animated gradients and special effects.

## Features

✨ **Animated Gradient Background** - Smooth color transitions between purple (#947eff), pink (#ff69da), and white
🌟 **Shimmer Effect** - Sleek shimmer animation on hover
💫 **Particle Effects** - Floating particles that appear on hover
🎨 **Glow Effect** - Beautiful glow around the button on hover
⚡ **Loading State** - Built-in spinner animation
🎯 **Sparkles Icon** - AI-themed icon that rotates on hover
📏 **Three Sizes** - Small, medium, and large variants

---

## Usage

### Basic Example

```tsx
import { AIButton } from '@/components/ui/ai-button';

export function MyComponent() {
  return (
    <AIButton onClick={() => console.log('AI Magic!')}>
      Generate AI Content
    </AIButton>
  );
}
```

### With Loading State

```tsx
import { AIButton } from '@/components/ui/ai-button';

export function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    // Your AI logic here
    await generateAIContent();
    setIsLoading(false);
  };

  return (
    <AIButton 
      onClick={handleGenerate} 
      isLoading={isLoading}
    >
      {isLoading ? 'Generating...' : 'Generate AI Reply'}
    </AIButton>
  );
}
```

### Different Sizes

```tsx
<AIButton size="sm">Small AI Button</AIButton>
<AIButton size="md">Medium AI Button</AIButton> {/* Default */}
<AIButton size="lg">Large AI Button</AIButton>
```

### Disabled State

```tsx
<AIButton disabled>
  Cannot Generate
</AIButton>
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Button text/content |
| `isLoading` | `boolean` | `false` | Shows loading spinner |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Disables the button |
| `onClick` | `() => void` | - | Click handler |
| `className` | `string` | - | Additional CSS classes |

Plus all standard HTML button attributes!

---

## Visual Effects

### 1. **Gradient Animation**
- 3-second smooth transition
- Colors flow from left to right
- Creates a "living" effect

### 2. **Hover Effects**
- ✨ Sparkles icon rotates 12 degrees and scales up
- 💫 Three particles float around the button
- 🌟 Shimmer passes across the button
- 💎 Glow appears around the button edges
- 🔆 Shadow becomes more prominent

### 3. **Loading State**
- Sparkles icon replaced with spinning loader
- Button remains interactive (disabled)
- Smooth transition between states

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Purple | `#947eff` | Primary gradient start/end |
| Pink | `#ff69da` | Gradient middle |
| White | `#ffffff` | Text & effects |

---

## Where to Use

✅ **AI Content Generation**
- Generate blog posts
- Create social media captions
- Write email responses
- Generate product descriptions

✅ **AI Replies**
- Review responses (✓ Currently used)
- Customer support replies
- Comment responses

✅ **AI Analysis**
- Sentiment analysis
- Content optimization
- Image analysis
- Data insights

✅ **AI Suggestions**
- Caption suggestions
- Hashtag recommendations
- Post time optimization
- Content ideas

---

## Examples in the App

### 1. Review Management (✓ Implemented)
```tsx
<AIButton
  size="md"
  onClick={() => generateAIReply(selectedReview)}
  isLoading={isGeneratingReply}
>
  {isGeneratingReply ? 'Generating...' : 'Generate AI Reply'}
</AIButton>
```

### 2. Caption Generator (Future)
```tsx
<AIButton
  size="lg"
  onClick={generateCaption}
  isLoading={isGenerating}
>
  Generate Caption
</AIButton>
```

### 3. Content Optimizer (Future)
```tsx
<AIButton
  size="sm"
  onClick={optimizeContent}
>
  Optimize with AI
</AIButton>
```

---

## Customization

### Adding Custom Styles

```tsx
<AIButton className="w-full mt-4">
  Full Width Button
</AIButton>
```

### Custom Click Handler

```tsx
<AIButton 
  onClick={async () => {
    console.log('Starting AI generation...');
    const result = await callAIAPI();
    console.log('AI result:', result);
  }}
>
  Generate
</AIButton>
```

---

## Technical Details

### Dependencies
- `lucide-react` - For Sparkles & Loader2 icons
- `@/lib/utils` - For cn() utility (class merging)

### Animations
All animations are defined in `globals.css`:
- `@keyframes gradient` - Background gradient flow
- `@keyframes shimmer` - Shimmer effect
- `@keyframes particle-1/2/3` - Particle animations

### Accessibility
- ✅ Proper disabled state
- ✅ Keyboard accessible
- ✅ Screen reader friendly
- ✅ Focus visible states

---

## Browser Support

✅ Chrome/Edge (latest)  
✅ Firefox (latest)  
✅ Safari (latest)  
✅ Mobile browsers

All modern browsers with CSS animations support.

---

## Performance

- **Lightweight** - No heavy dependencies
- **GPU Accelerated** - Uses transform & opacity for smooth animations
- **Optimized** - Animations only run on hover
- **Smooth** - 60fps animations

---

## Best Practices

### ✅ Do
- Use for AI-powered features
- Provide clear text ("Generate AI Reply")
- Handle loading states properly
- Show feedback to users

### ❌ Don't
- Use for regular actions (use normal Button)
- Use without AI context
- Overuse on same page (max 2-3)
- Forget to handle errors

---

## Future Enhancements

🔮 **Potential additions:**
- Success animation on completion
- Error state styling
- Progress bar variant
- Sound effects option
- More color themes
- Pulse animation option

---

## Credits

**Design:** Modern AI-themed gradient button  
**Colors:** Purple (#947eff) + Pink (#ff69da) + White  
**Effects:** Gradient animation, shimmer, particles, glow  
**Icon:** Sparkles (represents AI magic)

---

## Questions?

This component is ready to use anywhere you need AI-powered actions!

Just import and add wherever you generate AI content. 🚀✨
