"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, CheckCircle, AlertTriangle, Info, Package, CreditCard, Calendar, Users, Filter, Trash2, CheckCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// بيانات إشعارات وهمية
const mockNotifications = [
  { 
    id: "not001", 
    type: "تحذير", 
    title: "مخزون منخفض", 
    message: "المنتج 'تفاح عضوي (1 كجم)' وصل إلى مستوى المخزون الحرج (5 وحدات متبقية).", 
    date: "2024-07-15T10:30:00Z", 
    read: false,
    category: "مخزون"
  },
  { 
    id: "not002", 
    type: "معلومات", 
    title: "طلب جديد", 
    message: "تم استلام طلب جديد من العميل 'شركة الأمل للتجارة' بقيمة 1250.75 ل.س.", 
    date: "2024-07-15T09:15:00Z", 
    read: true,
    category: "مبيعات"
  },
  { 
    id: "not003", 
    type: "نجاح", 
    title: "تم الدفع", 
    message: "تم استلام دفعة بقيمة 3500 ل.س من العميل 'مؤسسة النجاح الحديثة'.", 
    date: "2024-07-14T14:30:00Z", 
    read: false,
    category: "مالية"
  },
  { 
    id: "not004", 
    type: "تذكير", 
    title: "موعد تسليم", 
    message: "غداً موعد تسليم طلب الشراء #PO025 من المورد 'الشركة العالمية للتوريدات'.", 
    date: "2024-07-14T08:00:00Z", 
    read: true,
    category: "مشتريات"
  },
  { 
    id: "not005", 
    type: "تحذير", 
    title: "فاتورة مستحقة", 
    message: "الفاتورة #INV003 مستحقة الدفع خلال 3 أيام للعميل 'محلات الوفاء'.", 
    date: "2024-07-13T11:45:00Z", 
    read: false,
    category: "مالية"
  },
  { 
    id: "not006", 
    type: "معلومات", 
    title: "موظف جديد", 
    message: "تم إضافة الموظف 'سارة أحمد' بنجاح إلى النظام.", 
    date: "2024-07-12T09:30:00Z", 
    read: true,
    category: "موظفين"
  },
  { 
    id: "not007", 
    type: "تذكير", 
    title: "تجديد اشتراك", 
    message: "اشتراكك في النظام سينتهي خلال 7 أيام. يرجى تجديد الاشتراك لتجنب انقطاع الخدمة.", 
    date: "2024-07-11T15:20:00Z", 
    read: false,
    category: "نظام"
  },
];

// إعدادات الإشعارات
const notificationSettings = [
  { id: "inventory", name: "تنبيهات المخزون", description: "إشعارات عند وصول المنتجات إلى مستوى منخفض", enabled: true, icon: Package },
  { id: "sales", name: "إشعارات المبيعات", description: "إشعارات عند استلام طلبات جديدة وتحديثات الطلبات", enabled: true, icon: CreditCard },
  { id: "finance", name: "إشعارات مالية", description: "إشعارات الدفعات المستلمة والفواتير المستحقة", enabled: true, icon: CreditCard },
  { id: "purchases", name: "إشعارات المشتريات", description: "تذكيرات بمواعيد التسليم وتحديثات أوامر الشراء", enabled: true, icon: Package },
  { id: "employees", name: "إشعارات الموظفين", description: "تحديثات حول الموظفين والإجازات والرواتب", enabled: false, icon: Users },
  { id: "system", name: "إشعارات النظام", description: "تحديثات النظام والصيانة وتجديد الاشتراك", enabled: true, icon: Info },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState(mockNotifications);
  const [settings, setSettings] = useState(notificationSettings);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  // تصفية الإشعارات
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "unread" && notification.read) return false;
    if (categoryFilter !== "all" && notification.category !== categoryFilter) return false;
    return true;
  });

  // تغيير حالة قراءة الإشعار
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // تغيير حالة قراءة جميع الإشعارات
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast({
      title: "تم تحديث الإشعارات",
      description: "تم تعليم جميع الإشعارات كمقروءة.",
    });
  };

  // حذف إشعار
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast({
      title: "تم حذف الإشعار",
      description: "تم حذف الإشعار بنجاح.",
    });
  };

  // تغيير إعدادات الإشعارات
  const toggleNotificationSetting = (id: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `منذ ${diffMins} دقيقة`;
    } else if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`;
    } else if (diffDays < 7) {
      return `منذ ${diffDays} يوم`;
    } else {
      return date.toLocaleDateString('ar-SA');
    }
  };

  // أيقونة نوع الإشعار
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "تحذير": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "نجاح": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "معلومات": return <Info className="h-5 w-5 text-blue-500" />;
      case "تذكير": return <Calendar className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">الإشعارات والتنبيهات</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={markAllAsRead}
            disabled={!notifications.some(n => !n.read)}
          >
            <CheckCheck className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تعليم الكل كمقروء
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="grid grid-cols-2 w-full sm:w-[300px] rounded-md">
            <TabsTrigger value="all" className="rounded-sm">جميع الإشعارات</TabsTrigger>
            <TabsTrigger value="unread" className="rounded-sm">غير المقروءة</TabsTrigger>
          </TabsList>

          <Select value={categoryFilter} onValueChange={setCategoryFilter} dir="rtl">
            <SelectTrigger className="w-full sm:w-[200px] rounded-md">
              <SelectValue placeholder="تصفية حسب النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              <SelectItem value="مخزون">مخزون</SelectItem>
              <SelectItem value="مبيعات">مبيعات</SelectItem>
              <SelectItem value="مالية">مالية</SelectItem>
              <SelectItem value="مشتريات">مشتريات</SelectItem>
              <SelectItem value="موظفين">موظفين</SelectItem>
              <SelectItem value="نظام">نظام</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card className="shadow-lg rounded-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
                جميع الإشعارات
              </CardTitle>
              <CardDescription>
                عرض جميع الإشعارات والتنبيهات المتعلقة بنشاط عملك.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد إشعارات لعرضها.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-lg border ${notification.read ? 'bg-background' : 'bg-muted/30 border-primary/20'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h3 className={`font-semibold ${!notification.read ? 'text-primary' : ''}`}>{notification.title}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{formatDate(notification.date)}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-full hover:bg-muted"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm mt-1">{notification.message}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{notification.category}</span>
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs rounded-md hover:bg-primary/10 hover:text-primary"
                                onClick={() => markAsRead(notification.id)}
                              >
                                تعليم كمقروء
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-0">
          <Card className="shadow-lg rounded-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
                الإشعارات غير المقروءة
              </CardTitle>
              <CardDescription>
                عرض الإشعارات والتنبيهات التي لم تقرأها بعد.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد إشعارات غير مقروءة.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="p-4 rounded-lg border bg-muted/30 border-primary/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-primary">{notification.title}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{formatDate(notification.date)}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 rounded-full hover:bg-muted"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm mt-1">{notification.message}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{notification.category}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs rounded-md hover:bg-primary/10 hover:text-primary"
                              onClick={() => markAsRead(notification.id)}
                            >
                              تعليم كمقروء
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="shadow-lg rounded-lg border-border mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            إعدادات الإشعارات
          </CardTitle>
          <CardDescription>
            تخصيص أنواع الإشعارات التي ترغب في تلقيها.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {settings.map((setting) => (
              <div key={setting.id} className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="mt-0.5">
                  <setting.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-grow space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`notification-${setting.id}`} className="font-medium">{setting.name}</Label>
                    <Switch 
                      id={`notification-${setting.id}`} 
                      checked={setting.enabled}
                      onCheckedChange={() => toggleNotificationSetting(setting.id)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}