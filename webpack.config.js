var path = require('path') // 引入模块 为出口文件指定 路径
var HtmlWebpackPlugin = require('html-webpack-plugin'); //使用插件的时候必须 引用 单独抽离 html文件 的插件
var uglify = require('uglifyjs-webpack-plugin'); // 压缩代码的插件
var Minify = require('mini-css-extract-plugin'); // 单独打包 所依赖的css文件 到dist文件下面 并且会在html文件中以link的形式引入css
module.exports = {
    // 入口文件 有三种格式 
    //1: 字符串 只有一个入口文件的时候
    // entry: './src/main.js',
    // 2.对象 多个入口文件时
    entry: {
        main: './src/main.js', //当前文件下的
        // pageA:'',
        // pageB

    },
    // 出口文件 
    output: {
        // 文件名 
        filename: 'bundle.js',
        //多输出文件的时候
        // filenames:'[name].js', 有多个输入文件时 就有多个输出文件
        // 必须规定路径
        path: path.resolve(__dirname, 'dist'), //__dirname ：根目录 打包到根目录 下的 dist文件夹下
        chunksFilename:"[name][hash:5].js"// 导出公共模块 的文件名
       // 需要进行 配置 optimization  如会输出 common+ hash 值.js的公共模块
    },
optimization:{

    splitChunks:{// 分离包 取代了3.0 中的插件
          cacheGroups:{// 这里开始设置缓存的 chunks
            common:{//其中的一个共同的模块
                  name:'common',// 设置模块的名字 
                  chunks:'all', //在哪些范围内寻找公共的模块 在哪些代码范围引入的
                 minSize:1,// 包能被单独抽离出来的体积 默认30kb
                 minChunk:2,// 公共模块被引入的最少次数
                priority:1,
                },
          vendor:{// 
              name:'vender',
              test:'/[\\/]node_modules[\\/]/',//在node_modules文件下匹配 
              priority:10,// 优先级  设置的比common 大 表示要先抽离  公共的第三方库 在抽离 业务代码
              chunks:'all'
            }
              
          }
    },
},
    mode: 'development', //配置环境 开发环境 production:生产环境
    // 在package.json 文件中 scripts中 设置了
    //  "dev" :"webpack --mode development --color",
    //"prod":"webpack --mode production --color" --color git信息颜色提醒
    //     "run" :"webpack" 代表在命令行中 敲run 代表 webpack
    //  在命令行中 直接  npm run dev 已开发环境打包 npm run prod 以生产环境打包
    // "server" : "webpack-dev-server --color --open" 开启服务器并 开启浏览器
    devServer: { //配置服务器里面的内容
        contentBase: 'dist', //基础路径 打开网页所展示的页面
        port: 9999, //修改端口号 防止与其他的端口冲突
        // 打包出来的文件 得是 绝对路径 不需要./ 为/
        hot:true,//开启热更新
    },
    module: { // webpack 默认只认识js文件 引入依赖其他类型的文件 实现需要 loader 解析 之前版本的 是 loaders 4 版本改了
        rules: [
            //css loader 解析
            { //遇到 css文件怎么做 用正则匹配
                test: /\.css$/, //以css文件结尾了
                use: ['style-loader', 'css-loader'], //解析css文件 从后往前 解析css文件之后 以style的标签的形式注入到js文件中去
                // 使用 之前需要下载 对应loader 解析器 npm install css-loader npm install style-loader -D 下载到开发环境中
                // 以style 形式解析成行间样式了
                // use: [Minify.loader, 'css-loader'],//使用插件 把css单独抽离出来
            },
            //以css文件 单独打包出来 以link 引入形式 需要plugin 插件配合
            { //html loadre
                test: /\.html$/,
                use: [ //用的 loader比较多 分开写
                    { //单独抽离的HTML文件 进行配置
                        loader: 'file-loader',
                        options: { //配置文件
                            name: 'index2.html'
                        }
                    },
                    { //单独抽出 文件 不然都会跑到设置的出口文件里去 在dist文件夹下生成了一个html文件
                        loader: 'extract-loader',
                    },
                    { //找到html文件 
                        loader: 'html-loader',
                        options:{// 可以解决 模板文件夹 里面 属性引入的 如图片等资源 不会被打包进dist文件夹的问题
                          attr:['img:src'],// 处理所有img src属性引入过来的图片
                        }
                    }
                ]
            },
            // {// js loader 处理包含有es6 语法的就是文件
            //    test:/\.js$/,
            //    use:['babel-loader']
            // },
            { // 文件里面包含了 图片的画 需要处理 图片 img  url-loader
                test: /\.(png||jpg||jpeg||gif)$/,
                //可以匹配 字符图标等
                use: [{
                    loader: 'url-loader',
                    options: { //图片大小 小于8192 用base64 码输出 就不会被单独抽离出来
                        limilt: 8192,
                        name: "img/[name].[ext]", //大于 limit 限制就输出 到dist文件夹下的 创建img文件夹 [name].[ext] 代表本来是什么文件名和格式 就是 叫什么文件名和格式
                        //    name:"img/[name]_[hash:8].[ext]",//  加一个hash值 当做每个文件 的身份证 如果文件改变的话 hash也会改变 [hash:8] 通过编译生产的hash值 
                        //    name:"img/[name]_[contenthash:8].[ext]",// 图片不能用contenthash 图片没有内容 css等文件可以[contenthash:8] 通过文件内容生产的hash值
                    //   或：
                    // name:"[name][hash:5].[ext]",
                    //  outputPath:'img',// 输出到img 文件夹下

                    }
                }, 
                {//图片压缩解析器
                    loader:'img-loader',
                    options:{
                        glugins:[
                            require('imagemin-pngquant')({
                                quality:[0.3,0,5],// 图片压缩的质量最少0.3 最多0.5
                            }),
                        ]
                    }
                }
            ],
            },
            {
                test: /\.less$/,
                use: [Minify.loader, 'css-loader', 'less-loader']
                // use:['style-loader','css-loader','less-loader']
            },
            // {
            //     text: /\.less/,
            //     use: [{
            //             loader: Minify.loader,
            //         },
            //         {
            //             loader: 'css-loader',
            //         },
            //         {
            //             loader:'postcss-loader',
            //             options:{
            //                 ident:'postcss',
            //                 plugins:[
            //                     require('postcss-cssnext')(), // 包含  require('autoprefixer')() 的功能只要写 一个
            //                     // require('autoprefixer')(),
            //                     require('cssnano')()
            //                 ]
            //             }
            //         },
            //         {
            //             loader:'less.loader'
            //         }
            //     ]
            // }
        ], //用到很多 loder 
    },
    // 配置插件
    plugins: [
        new HtmlWebpackPlugin({
            //  单独抽离出的主文件夹 自动引入css js 等文件
            // 不需要 loader 解析器 就能自动 抽离 但需要 html-loader 抽离里面 如img 引入的图片 到dist文件夹下
            // chunks: ['app'] 传入 多个 html 文件 
            title: 'title', // 设置解析出来 在dist文件夹下HTML文件的title
            template: './src/index2.html', //html插件单独抽离出来的html文件是以 这个设置的模板抽离出来的
            //  当  单独抽离的html 有dom 结构的 时候 就以他为模板生成
            //没用依赖 index2.html 所有里面的图片不会被打包 但index.css 依赖了一张图片 所以那张图片会被打包
            minify: {
                collapseWhitespace: true, //是否压缩html文件里面的空白
                removeComments:true,// 清除 注释
            }
        }), //没依赖html文件  用插件的形式解析src文件夹里面的html文件  依赖用loader的形式解析
        new uglify(), //压缩代码的插件
        new Minify({
            filename: '[name]_[contenthash:8].css', //规定单独抽离出来css的名字[name]代表本来加什么名字 就叫什么名字 再根据内容生产hash值
        }), //// 单独打包 str文件里面的css文件 到dist文件下面 并且会在html文件中以link的形式引入css

        //  new PurifyCSSPlugin({
        //      paths: glob.sync([
        //         path.join(__dirname, './*.html'),
        //         path.join(__dirname, './*.js')
        //      ]), 
        //     }),
        // new WebpackDeepScopeAnalysisPlugin(),
        // new CleanWebpackPlugin(),
        // new webpack.HotModuleReplacementPlugin()
    ],
} // 为默认配置
//如果有多的配置
//shell命令语句 webpack -config=文件名  属于shell命令与配置文件配合打包
// webpack 简单工作流程 
// 1.初始化  可以 用shell命令与配置文件配合  初始化 
// 2.编译 :首先 走入口文件 看里面所依赖的什么 再根据依赖的找到每个文件 可能文件 类型不同 再根据 loader解析器 plugin 插件 处理   具体 首先根据 初始化的参数编译一个对象 加载所有配置的插件 执行 插件 编译 再 确定入口 根据配置文件里的entry 找到所有路口 从路口文件出发找到所有依赖的文件 根据loader 进行解析翻译 
//3。输出 把多个模块 组成一个代码块  把代码块转出一个单独的文件 加到输出列表里面 dist 入main.js 再根据output 规定的路径 和文件名输出到 dist文件夹下 再将文件写入系统
// 4.再监听代码改变 就不用初始化了 配置文件发生改变 是监听不到的 


// tree shaking js/css  树抖动 开发环境不会 生产环境打包后会剔除没有用到的 js 或css 代码 

// js tree shaking
//   树抖动 树抖动只会根据词语 和语法 进行分析 没有依赖的函数 但作用域里面依赖了其他的模块也会打包
//  不会 根据作用域分析   没有依赖函数 的作用域里面依赖的东西也不会打包
// 解决：
// 下载 深度 作用域抖动的插件  npm install webpack-dee-scope-glugin -D 到www.npmjs.com 搜索 webpack-deep-scope-plugin 插件 看他gitHub 使用说明
//  const WebpackDeepScopeAnalysisPlugin = require('webpack-deep-scope-plugin').default

//  css tree shaking 
//  CSS 抖动需要放在js抖动之前 否则报错
//  需要下载的插件 npm install -D purifycss-webpack 和 purify-css
//  需要引入这些 都需要下载
// const path = require('path');
// const glob = require('glob');
// const PurifyCSSPlugin = require('purifycss-webpack');
//  在 plugins [] js tree shaking 之前 newPurifyCSSPlugin
//  new PurifyCSSPlugin({

//    paths: glob.sync(path.join(__dirname, './*.html')), 
// })
//    ( __dirname, './*.html')   这是代表 根据跟目录下 html 文件的结构 抖动对应的css文件
//  但是不能 js 里面 动态插入的dom结构依赖的css 样式可能 会被 去掉 
//  这么解决: 加入一个 path.join(__dirname, './*.js') 还要根据 js动态插入的dom结构来对比 剔除
//  但需要引入  //  const glob = require('glob'); 变为 const glob = require('glob-all');
//  new PurifyCSSPlugin({

//      paths: glob.sync([
//         path.join(__dirname, './*.html'),
//         path.join(__dirname, './*.js')
//      ]), 
//     }),

// postcss 
// 需要的插件  
// npm install postcss  postcss-loader autoprefixer cssnano postcss-cssnext -D
//  postcss 解析器里面的插件 autoprefixer 自动 加css3 前缀的   cssnano 压缩的 postcss-cssnext 将cssnext 语法转为 css 并自动添加前缀
// 在 less-loader 前面 添加 postcss-loader 
// {
//     loader:'postcss-loader',
//     options:{
//         ident:'postcss',
//         plugins:[
//             require('postcss-cssnext')(), // 包含  require('autoprefixer')() 的功能只要写 一个
//             // require('autoprefixer')(),
//             require('cssnano')()
//         ]
//     }
// }

//  每次打包 清除之前 打包的文件 的插件
//  nmp install clean-webpack-plugin -D
// CleanWebpackPlugin = require('clean-webpack-plugin');

//  每个插件 都可以传参数 的  到gitHub上看


//  提取公共js 代码
// 如 两个入口文件 都分别 引入了jq 

// 解析图片插件 

//  npm install url-loader  img-loader -D  
//  还要下载 npm install file-loader -D 
// img-loader 压缩图片的
//  需要下载插件  imagemin-pngquant    和 imagemin 


//  开启服务器 
//  npm install webpack-dev-server -g   还需要 在 局部下载 -D
//  执行 webpack-dev-server 
//  webpack-dev-server --open 运行完自动开启浏览器页面
//  webpack-dev-server --open --color git有颜色提醒 报错

// 不开启服务器的监听
// webpack --watch  简写 -w

// 取到本地数据  直接在4.0 版本不用插件 直接 var name = require('./path')
//  需要把 本地 数据 放到dist 文件夹下  并且先关别 每次打包前清空dist文件夹的CleanWebpack 插件  
//  引入jq  先下载 npm i jquery -D  i 为install缩写
// 引入  import $ from "jquery"

// //  webpack-dev-server --hot 热跟新 只刷新修改的那一部分  轮询 
//  但不支持单独抽离的 css文件 的热更新
//  webpack 内置插件 var webpack =require('webpack')
// 在插件中调用 new webpack.HotModuleReplacementPlugin()
// 在 devServer 中开启 热更新  hot :true
// 更新 js 时 需要设置：
// if(module.hot){
//     module.hot.accept();// 让js 接受 热更新 
// }


//