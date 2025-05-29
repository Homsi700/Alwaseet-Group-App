import os

def generate_folder_tree(startpath, output_file='folder_tree.txt', indent_char='    '):
    """
    ينشئ هيكل شجري للمجلدات والملفات داخل مسار معين.

    Args:
        startpath (str): المسار الأساسي للمجلد الذي سيتم تحليل هيكله.
        output_file (str): اسم الملف الذي سيتم حفظ الهيكل فيه.
        indent_char (str): الأحرف المستخدمة للمسافة البادئة (افتراضي: 4 مسافات).
    """
    # قائمة المجلدات التي سيتم استثناؤها (مثل مجلدات المكتبات، مجلدات Git، إلخ)
    exclude_dirs = [
        '__pycache__',   # مجلدات بايثون المؤقتة
        '.git',          # مجلدات Git للتحكم بالإصدار
        'venv',          # بيئات بايثون الافتراضية
        'node_modules',  # مجلد مكتبات JavaScript/TypeScript (الضخم!)
        '.vscode',       # إعدادات VS Code
        '.idea',         # إعدادات PyCharm/IntelliJ IDEA
        'build',         # مجلدات البناء
        'dist',          # مجلدات التوزيع
        '__MACOSX'       # مجلدات مؤقتة من macOS عند فك الضغط
    ]
    # قائمة الملفات التي سيتم استثناؤها (ملفات الإعدادات، ملفات README، إلخ)
    exclude_files = [
        '.gitignore',    # ملفات Git لتجاهل الملفات
        '.env',          # ملفات المتغيرات البيئية
        'pyproject.toml', # إعدادات مشاريع بايثون الحديثة
        'package-lock.json', # ملفات قفل التبعيات في Node.js
        'yarn.lock',     # ملفات قفل التبعيات في Yarn
        'README.md',     # ملفات الـ Readme
        'LICENSE'        # ملفات الترخيص
    ]

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
            # لا نكتب المجلد الأساسي مرة أخرى في البداية لأنه مكتوب في العنوان
            if root != startpath:
                f.write(f'{indent}📁 {os.path.basename(root)}/\n')
            else: # للمجلد الجذر، لا تضع بادئة ولكن اكتب اسمه
                 f.write(f'📁 {os.path.basename(root)}/\n')


            # اكتب الملفات داخل المجلد الحالي
            # المسافة البادئة للملفات يجب أن تكون أكبر بمستوى واحد من المجلد
            file_indent = indent_char * (level + 1)
            for file in sorted(files): # لترتيب الملفات أبجديًا
                if file not in exclude_files:
                    f.write(f'{file_indent}📄 {file}\n')
    print("\n✅ تم الانتهاء من إنشاء ملف هيكل المجلد.")
    print(f"يمكنك فتح الملف '{output_file}' لرؤية الهيكل.")


if __name__ == "__main__":
    # --- كيفية الاستخدام ---

    # اطلب المسار من المستخدم عند التشغيل
    project_folder_path = input("الرجاء إدخال المسار الكامل للمجلد الذي تريد تحليل هيكله (أو اضغط Enter للمجلد الحالي): ").strip()

    # إذا ترك المستخدم الإدخال فارغًا، استخدم المجلد الحالي الذي يتم تشغيل السكربت منه
    if not project_folder_path:
        project_folder_path = os.getcwd()
        print(f"لم يتم تحديد مسار، سيتم استخدام المجلد الحالي: {project_folder_path}")

    # تحقق مما إذا كان المسار المدخل موجودًا وهو مجلد فعلاً
    if not os.path.isdir(project_folder_path):
        print(f"❌ خطأ: المسار '{project_folder_path}' غير موجود أو ليس مجلدًا. يرجى التحقق من المسار والمحاولة مرة أخرى.")
    else:
        generate_folder_tree(project_folder_path)
        