import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Edit3
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter your content...",
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'italic':
        insertText('*', '*');
        break;
      case 'underline':
        insertText('<u>', '</u>');
        break;
      case 'code':
        insertText('`', '`');
        break;
      case 'quote':
        insertText('> ');
        break;
      case 'h1':
        insertText('# ');
        break;
      case 'h2':
        insertText('## ');
        break;
      case 'h3':
        insertText('### ');
        break;
      case 'ul':
        insertText('- ');
        break;
      case 'ol':
        insertText('1. ');
        break;
      case 'link':
        insertText('[', '](url)');
        break;
      case 'image':
        insertText('![alt text](', ')');
        break;
    }
  };

  const renderPreview = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.substring(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold mt-4 mb-2">{line.substring(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
        }
        
        // Quote
        if (line.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-600">
              {line.substring(2)}
            </blockquote>
          );
        }
        
        // Lists
        if (line.startsWith('- ')) {
          return (
            <ul key={index} className="list-disc list-inside my-1">
              <li>{line.substring(2)}</li>
            </ul>
          );
        }
        if (/^\d+\. /.test(line)) {
          return (
            <ol key={index} className="list-decimal list-inside my-1">
              <li>{line.substring(line.indexOf('. ') + 2)}</li>
            </ol>
          );
        }
        
        // Format text within line
        let formattedLine = line;
        
        // Bold
        formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Underline
        formattedLine = formattedLine.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
        
        // Code
        formattedLine = formattedLine.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>');
        
        // Links
        formattedLine = formattedLine.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
        
        // Images
        formattedLine = formattedLine.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-2" />');
        
        if (formattedLine.trim() === '') {
          return <br key={index} />;
        }
        
        return (
          <p 
            key={index} 
            className="mb-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Content Editor</CardTitle>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
            <TabsList className="grid w-48 grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center">
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'edit' && (
          <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-gray-50">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('h1')}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('h2')}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('h3')}
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('bold')}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('italic')}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('underline')}
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('code')}
                title="Code"
              >
                <Code className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('ul')}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('ol')}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('quote')}
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('link')}
                title="Link"
              >
                <Link className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText('image')}
                title="Image"
              >
                <Image className="w-4 h-4" />
              </Button>
            </div>

            {/* Text Area */}
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={12}
              className="font-mono text-sm"
            />

            {/* Helper Text */}
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Formatting Tips:</strong></p>
              <p>**bold** *italic* `code` &gt; quote</p>
              <p># Heading 1, ## Heading 2, ### Heading 3</p>
              <p>- Bullet list, 1. Numbered list</p>
              <p>[Link text](url) ![Image alt](image-url)</p>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="min-h-64 p-4 border rounded-lg bg-white">
            {value.trim() ? (
              <div className="prose prose-sm max-w-none">
                {renderPreview(value)}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                No content to preview. Switch to Edit tab to add content.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
