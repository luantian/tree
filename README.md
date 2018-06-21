# tree 树组件
### 一个原生js编写的渲染树状数据结构的组件
| param        | type          |  default                   |   need   | description                     |
| --------     | -----:        |  :----:                    |
| container    | DOM           |   null                     |   true   | 加载树结构的dom节点               |
| data         | Array/Object  |   null                     |   true   | 渲染的树结构数据                  |
| level        | [a,b,c,d...]  |   null                     |   false  | 想要渲染到的层级                  |
| arguConfig   | Object        | {name: "N", children: "C"} |   false  | 配置显示内容的字段和子级数据的字段  | 
| callback     | Function      |   null                     |   false  | 点击"树枝"的回调函数              |
| expand       | Function      |   null                     |   false  | "树枝"第一次展开时执行的方法         
此方法的返回值可以替换当前的子节点数据 |
| fold         | Function      |   null                     |   false  | "树枝"每次折叠时执行的方法         |
| stopKey      | String        |   null                     |   false  | 树数据中遇到此属性，停止向下渲染    |
| eteKey       | Array         |   null                     |   false  | 配置点击"树枝"时返回的属性         |