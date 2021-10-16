# excel2json
xlsx表格转json

需安装node

配置文件为config.json,格式示例如下

```
{
    "isPretty": true,
    "isArray": false,
    "dir": [
        {
            "input": "E:\\ts\\testEx",
            "output": "E:\\ts\\testEx"
        }
    ]
}
```
isPretty为是否美化输出，isArray为输出格式为字典或数组，input为输入路径，output为输出路径。

双击excel2json.bat 生成文件
