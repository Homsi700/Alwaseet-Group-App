import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Command } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ShortcutDefinition {
  key: string;
  description: string;
  action: () => void;
  global?: boolean;
  disabled?: boolean;
}

interface ShortcutGroup {
  name: string;
  shortcuts: ShortcutDefinition[];
}

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
  shortcuts?: ShortcutGroup[];
}

interface KeyboardShortcutsContextType {
  registerShortcut: (shortcut: ShortcutDefinition) => void;
  unregisterShortcut: (key: string) => void;
  showShortcutsDialog: () => void;
}

const KeyboardShortcutsContext = React.createContext<KeyboardShortcutsContextType | undefined>(undefined);

// مكون لعرض اختصار لوحة المفاتيح
export function KeyboardShortcut({ shortcut }: { shortcut: string }) {
  const keys = shortcut.split('+');
  
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded border">
            {key === 'Cmd' ? '⌘' : key === 'Shift' ? '⇧' : key === 'Alt' ? '⌥' : key === 'Ctrl' ? '⌃' : key}
          </kbd>
          {index < keys.length - 1 && <span>+</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// مزود اختصارات لوحة المفاتيح
export function KeyboardShortcutsProvider({ children, shortcuts = [] }: KeyboardShortcutsProviderProps) {
  const [registeredShortcuts, setRegisteredShortcuts] = useState<ShortcutDefinition[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  
  // تسجيل اختصارات افتراضية
  useEffect(() => {
    const defaultShortcuts: ShortcutDefinition[] = [
      {
        key: '?',
        description: 'عرض اختصارات لوحة المفاتيح',
        action: () => setIsDialogOpen(true),
        global: true,
      },
      {
        key: 'g+h',
        description: 'الانتقال إلى الصفحة الرئيسية',
        action: () => router.push('/'),
        global: true,
      },
      {
        key: 'g+d',
        description: 'الانتقال إلى لوحة المعلومات',
        action: () => router.push('/dashboard'),
        global: true,
      },
      {
        key: 'g+p',
        description: 'الانتقال إلى المنتجات',
        action: () => router.push('/products'),
        global: true,
      },
      {
        key: 'g+s',
        description: 'الانتقال إلى المبيعات',
        action: () => router.push('/sales'),
        global: true,
      },
      {
        key: 'g+i',
        description: 'الانتقال إلى المخزون',
        action: () => router.push('/inventory'),
        global: true,
      },
      {
        key: 'Escape',
        description: 'إغلاق النوافذ المنبثقة',
        action: () => setIsDialogOpen(false),
        global: true,
      },
    ];
    
    setRegisteredShortcuts(defaultShortcuts);
  }, [router]);
  
  // تسجيل اختصار جديد
  const registerShortcut = (shortcut: ShortcutDefinition) => {
    setRegisteredShortcuts((prev) => {
      // إزالة الاختصار إذا كان موجوداً بالفعل
      const filtered = prev.filter((s) => s.key !== shortcut.key);
      return [...filtered, shortcut];
    });
  };
  
  // إلغاء تسجيل اختصار
  const unregisterShortcut = (key: string) => {
    setRegisteredShortcuts((prev) => prev.filter((s) => s.key !== key));
  };
  
  // عرض نافذة الاختصارات
  const showShortcutsDialog = () => {
    setIsDialogOpen(true);
  };
  
  // معالجة ضغطات المفاتيح
  useEffect(() => {
    const keySequence: string[] = [];
    let keySequenceTimer: NodeJS.Timeout;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // تجاهل الضغطات في حقول الإدخال
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }
      
      const key = event.key;
      
      // إضافة المفتاح إلى تسلسل المفاتيح
      keySequence.push(key);
      
      // إعادة ضبط تسلسل المفاتيح بعد فترة زمنية
      clearTimeout(keySequenceTimer);
      keySequenceTimer = setTimeout(() => {
        keySequence.length = 0;
      }, 1000);
      
      // التحقق من الاختصارات المسجلة
      registeredShortcuts.forEach((shortcut) => {
        if (shortcut.disabled) return;
        
        const shortcutKeys = shortcut.key.split('+');
        
        // التحقق من تطابق المفتاح الواحد
        if (shortcutKeys.length === 1 && key === shortcutKeys[0]) {
          event.preventDefault();
          shortcut.action();
          return;
        }
        
        // التحقق من تطابق تسلسل المفاتيح
        if (shortcutKeys.length > 1) {
          const sequenceMatches = shortcutKeys.every(
            (k, i) => keySequence[keySequence.length - shortcutKeys.length + i] === k
          );
          
          if (sequenceMatches && keySequence.length >= shortcutKeys.length) {
            event.preventDefault();
            shortcut.action();
            keySequence.length = 0;
            return;
          }
        }
      });
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(keySequenceTimer);
    };
  }, [registeredShortcuts]);
  
  // تنظيم الاختصارات في مجموعات
  const organizeShortcuts = () => {
    const defaultGroups: ShortcutGroup[] = [
      {
        name: 'عام',
        shortcuts: registeredShortcuts.filter((s) => s.global),
      },
      {
        name: 'التنقل',
        shortcuts: registeredShortcuts.filter((s) => s.key.startsWith('g+')),
      },
    ];
    
    return [...defaultGroups, ...shortcuts];
  };
  
  return (
    <KeyboardShortcutsContext.Provider
      value={{
        registerShortcut,
        unregisterShortcut,
        showShortcutsDialog,
      }}
    >
      {children}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" /> اختصارات لوحة المفاتيح
            </DialogTitle>
            <DialogDescription>
              استخدم اختصارات لوحة المفاتيح للتنقل بسرعة في التطبيق.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {organizeShortcuts().map((group) => (
              <div key={group.name} className="space-y-3">
                <h3 className="font-semibold text-foreground">{group.name}</h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <KeyboardShortcut shortcut={shortcut.key} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-md"
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </KeyboardShortcutsContext.Provider>
  );
}

// Hook لاستخدام اختصارات لوحة المفاتيح
export function useKeyboardShortcuts() {
  const context = React.useContext(KeyboardShortcutsContext);
  
  if (context === undefined) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  
  return context;
}

// زر لعرض اختصارات لوحة المفاتيح
export function KeyboardShortcutsButton() {
  const { showShortcutsDialog } = useKeyboardShortcuts();
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={showShortcutsDialog}
      className="rounded-md"
    >
      <Command className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
      <span>اختصارات لوحة المفاتيح</span>
    </Button>
  );
}