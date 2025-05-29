import os

def generate_folder_tree(startpath, output_file='folder_tree.txt', indent_char='    ', exclude_dirs=None, exclude_files=None):
    """
    ينشئ هيكل شجري للمجلدات والملفات داخل مسار معين.

    Args:
        startpath (str): المسار الأساسي للمجلد الذي سيتم تحليل هيكله.
        output_file (str): اسم الملف الذي سيتم حفظ الهيكل فيه.
        indent_char (str): الأحرف المستخدمة للمسافة البادئة (افتراضي: 4 مسافات).
        exclude_dirs (list): قائمة بأسماء المجلدات لاستثنائها.
        exclude_files (list): قائمة بأسماء الملفات لاستثنائها.
    """
    if exclude_dirs is None:
        # مجلدات يتم استثناؤها بشكل شائع في مشاريع البرمجة
        exclude_dirs = ['__pycache__', '.git', 'venv', 'node_modules', '.vscode', '.idea', 'build', 'dist']
    if exclude_files is None:
        # ملفات يتم استثناؤها بشكل شائع
        exclude_files = ['.gitignore', '.env', 'pyproject.toml', 'package-lock.json', 'yarn.lock']

    print(f"جاري إنشاء هيكل المجلد لـ: {startpath}")
    print(f"سيتم حفظ النتائج في: {output_file}")

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f"Folder Tree for: {os.path.basename(startpath)}\n")
        f.write("=" * 30 + "\n\n")

        for root, dirs, files in os.walk(startpath):
            # احسب مستوى التعمق الحالي
            level = root.replace(startpath, '').count(os.sep)
            # أنشئ المسافة البادئة بناءً على المستوى
            indent = indent_char * level

            # قم بتصفية المجلدات المستثناة قبل المتابعة إليها
            # يجب تعديل 'dirs' في المكان لكي لا يقوم os.walk بزيارتها
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            # اكتب اسم المجلد الحالي
            f.write(f'{indent}📁 {os.path.basename(root)}/\n')

            # اكتب الملفات داخل المجلد الحالي
            file_indent = indent_char * (level + 1)
            for file in sorted(files): # لترتيب الملفات أبجديًا
                if file not in exclude_files:
                    f.write(f'{file_indent}📄 {file}\n')
    print("\n✅ تم الانتهاء من إنشاء ملف هيكل المجلد.")

if __name__ == "__main__":
    # --- كيفية الاستخدام ---

    # 1. المجلد الحالي (حيث يتم تشغيل السكربت)
    # project_folder_path = os.getcwd()

    # 2. لتحديد مجلد معين:
    # قم بتعديل هذا المسار إلى المجلد الذي تريد تحليل هيكله
    # مثال: project_folder_path = r'C:\test\Alwaseet-Group-App'
    # مثال: project_folder_path = r'/home/user/my_typescript_project' # لمستخدمي Linux/macOS

    # أفضل طريقة: اطلب المسار من المستخدم عند التشغيل
    project_folder_path = input("الرجاء إدخال المسار الكامل للمجلد الذي تريد تحليل هيكله (أو اضغط Enter للمجلد الحالي): ").strip()
    if not project_folder_path:
        project_folder_path = os.getcwd() # إذا ترك المستخدم الإدخال فارغًا، استخدم المجلد الحالي

    if not os.path.isdir(project_folder_path):
        print(f"❌ خطأ: المسار '{project_folder_path}' غير موجود أو ليس مجلدًا.")
    else:
        generate_folder_tree(project_folder_path)