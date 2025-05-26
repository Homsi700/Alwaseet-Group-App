import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  className?: string;
}

export function IconCard({ title, description, icon: Icon, href, className }: IconCardProps) {
  return (
    <Link href={href} passHref legacyBehavior>
      <a className="block hover:no-underline h-full">
        <Card className={cn("hover:shadow-xl transition-all duration-300 ease-in-out rounded-lg overflow-hidden h-full flex flex-col group bg-card text-card-foreground border border-border hover:border-primary/50", className)}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 p-5 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-primary group-hover:text-accent transition-colors">
                {title}
              </CardTitle>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-accent/10 transition-colors">
                <Icon className="h-7 w-7 text-primary group-hover:text-accent transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-5 pt-0">
            <CardDescription className="text-sm text-muted-foreground line-clamp-3">
              {description}
            </CardDescription>
          </CardContent>
          <div className="p-5 pt-2 mt-auto">
             <Button variant="outline" className="w-full group/button border-primary/30 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary focus-visible:ring-primary">
              Go to {title}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1 rtl:group-hover/button:-translate-x-1 icon-directional" />
            </Button>
          </div>
        </Card>
      </a>
    </Link>
  );
}
