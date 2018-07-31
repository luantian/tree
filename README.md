# tree 树组件
### 一个原生js编写的渲染树状数据结构的组件

### 使用实例, * 表示必传参数
```javascript
	var tree = $_$Tree({
		container: document.getElementById('tree'),  //DOM   加载树结构的dom节点   *
		data: data,  //树结构数据		*
		level: 'a',  //[a, b, c, d...]
		eteKey: ['id', 'children'], //点击"树枝"返回的数据只包含id, children两个属性
		stopKey: 'id', //树数据中遇到"树枝"包含id属性，停止向下层渲染,
	});

	tree.update(otherTreeData);
``` 
### 配置参数
| param        | type          |  default                              |   need   | description                                                  |
|  :----:      |  :----:       |  :----:                               |  :----:  |  :----:                                                      | 
| container    | DOM           |   null                                |   true   | 加载树结构的dom节点                                            |
| data         | Array/Object  |   null                                |   true   | 渲染的树结构数据, 如果是Object类型，那么树数据的字段必须为data     |           |
| level        | String        |   null                                |   false  | 想要渲染到的层级                                               |
| arguConfig   | Object        | {name: "name", children: "children"}  |   false  | 配置显示内容的字段和子级数据的字段                               | 
| callback     | Function      |   null                                |   false  | 点击"树枝"的回调函数                                           |
| expand       | Function      |   null                                |   false  | "树枝"第一次展开时执行的方法, 此方法的返回值可以替换当前的子节点数据 |
| fold         | Function      |   null                                |   false  | "树枝"每次折叠时执行的方法                                      |
| stopKey      | String        |   null                                |   false  | 树数据中遇到此属性，停止向下渲染                                 |
| eteKey       | Array         |   null                                |   false  | 配置点击"树枝"时返回的属性                                      |

### 实例方法

| name         |  param        | description                                                  |
| :----:       |  :----:       |  :----:                                                      |
| update       |  data         | 用来更新树结构内容的方法，参数同配置参数的data相同                 |