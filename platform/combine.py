import re

def replace_script_tags_and_variable(html_file, js_file, output_file):
    # 读取 HTML 文件内容
    with open(html_file, 'r', encoding='utf-8') as file:
        html_content = file.read()

    # 使用正则表达式替换 let student = true 为 false
    pattern_var = re.compile(r'let\s+student\s*=\s*true', re.DOTALL)
    modified_html_content = re.sub(pattern_var, 'let student = false', html_content)

    # 读取 app.js 文件内容
    with open(js_file, 'r', encoding='utf-8') as file:
        js_content = file.read()

    # 使用正则表达式替换 <script src="https://honeymath.com/honeyplatform/platform/app.js"></script> 标签
    pattern_script = re.compile(r'<script[^>]*src\s*=\s*[\'"]https://honeymath\.com/honeyplatform/platform/app\.js[\'"][^>]*>\s*</script>', re.DOTALL)
    modified_html_content = re.sub(pattern_script, lambda match: f'<script>\n{js_content}\n</script>', modified_html_content)

    # 将修改后的内容写入输出文件
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(modified_html_content)

# 使用示例
html_file = 'student.html'
js_file = 'app.js'
output_file = 'honeymath.html'
replace_script_tags_and_variable(html_file, js_file, output_file)

