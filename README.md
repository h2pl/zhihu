# zhihu
仿照知乎做的一个Java web项目，是一个sns+资讯的web应用。使用SpringBoot+Mybatis+velocity开发。数据库使用了redis和mysql，同时加入了异步消息等进阶功能，同时使用python爬虫进行数据填充。

内容包括：
开发工具和Java语言介绍
Spring入门，模板语法和渲染
数据库交互iBatis集成
用户注册登录管理
问题发布，敏感词和js标签过滤，问题广场
评论中心，站内信
Redis入门以及Redis实现赞踩功能
异步设计和站内邮件通知系统
sns关注功能，关注和粉丝列表页实现
timeline实现
python语法简介，pip工具介绍
python爬虫实现数据抓取和导入
站内全文搜索
项目测试和部署，课程总结回顾

# quick-start

[1项目基本配置](#项目基本配置)

[2基本框架开发](#基本框架开发)

[3数据库配置和首页的创建](#数据库配置和首页的创建)

[4用户注册登录以及使用token](#用户注册登录以及使用token)

[5新增发表问题功能，并防止xss注入以及敏感词过滤](#新增发表问题功能，并防止xss注入以及敏感词过滤)

[6新增评论和站内信功能](#新增评论和站内信功能)

[7新增点赞和点踩功能,使用Redis实现](#新增点赞和点踩功能，使用Redis实现)

[8新增异步消息功能,新增邮件发送组件](#新增异步消息功能 新增邮件发送组件)
## 项目基础配置

    创建git仓库，本地配置idea并测试pull和push。
    
    创建SpringBoot工程，导入Web，Velocity和Aop的包。
    
    生成Maven项目，pom.xml包含上述依赖，应用名称是toutiao,小组id是com.nowcoder。
    
## 基本框架开发
    
    创建基本的controller，service和model层。
    
    controller中使用注解配置，requestmapping，responsebody基本可以解决请求转发以及响应内容的渲染。responsebody自动选择viewresolver进行解析。
    
    使用pathvariable和requestparam传递参数。
    
    使用velocity编写页面模板，注意其中的语法使用。常用$!{}和${}
    
    使用http规范下的httpservletrequest和httpservletresponse来封装请求和相响应，使用封装好的session和cookie对象。
    
    使用重定向的redirectview和统一异常处理器exceptionhandler
    
AOP和IOC

    IOC解决对象实例化以及依赖传递问题，解耦。
    
    AOP解决纵向切面问题，主要实现日志和权限控制功能。
    
    aspect实现切面，并且使用logger来记录日志，用该切面的切面方法来监听controller。

## 数据库配置和首页的创建

    使用mysql创建数据库和表，建议自己写一下sql到mysql命令行跑一下。
    
    加入mybatis和mysql的maven仓库，注意，由于现在版本的springboot不再支持velocity进而导致我使用较早版本的springboot，所以这里提供一可以正常运行的版本设置。

    springboot使用1.4.0

    mybatis-spring-boot-starter使用1.2.1

    mysql-connector-java使用5.1.6

    亲测可用。
    
    接下来写controller，dao和service。注意mybatis的注解语法以及xml的配置要求，xml要求放在resource中并且与dao接口在相同的包路径下。
    
    application.properties增加spring配置数据库链接地址
    
    两个小工具：
    ViewObject:方便传递任何数据到
    VelocityDateTool:velocity自带工具类
    
    写好静态文件html css和js。并且注意需要配置
    spring.velocity.suffix=.html 保证跳转请求转发到html上
    spring.velocity.toolbox-config-location=toolbox.xml
    
    至此主页基本完成，具体业务逻辑请参考代码。
   
## 用户注册登录以及使用token

	完成用户注册和登录的controller,service和dao层代码

	新建数据表login_ticket用来存储ticket字段。该字段在用户登录成功时被生成并存入数据库，并被设置为cookie，
	下次用户登录时会带上这个ticket，ticket是随机的uuid，有过期时间以及有效状态。

	使用拦截器interceptor来拦截所有用户请求，判断请求中是否有有有效的ticket，如果有的话则将用户信息写入Threadlocal。
	所有线程的threadlocal都被存在一个叫做hostholder的实例中，根据该实例就可以在全局任意位置获取用户的信息。

	该ticket的功能类似session，也是通过cookie写回浏览器，浏览器请求时再通过cookie传递，区别是该字段是存在数据库中的，并且可以用于移动端。

	通过用户访问权限拦截器来拦截用户的越界访问，比如用户没有管理员权限就不能访问管理员页面。

	配置了用户的webconfiguration来设置启动时的配置，这里可以将上述的两个拦截器加到启动项里。

	配置了json工具类以及md5工具类，并且使用Java自带的盐生成api将用户密码加密为密文。保证密码安全。

	数据安全性的保障手段：https使用公钥加密私钥解密，比如支付宝的密码加密，单点登录验证，验证码机制等。

	ajax异步加载数据 json数据传输等。

## 新增发表问题功能，并防止xss注入以及敏感词过滤

	新增Question相关的model，dao，service和controller。

	发布问题时检查标题和内容，防止xss注入，并且过滤敏感词。

	防止xss注入直接使用HTMLutils的方法即可实现。

	过滤敏感词首先需要建立一个字典树，并且读取一份保存敏感词的文本文件，然后初始化字典树。
	最后将过滤器作为一个服务，让需要过滤敏感词的服务进行调用即可。

## 新增评论和站内信功能

	首先建立表comment和message分别代表评论和站内信。

	依次开发model，dao，service和controller。

	评论的逻辑是每一个问题下面都有评论，显示评论数量，具体内容，评论人等信息。

	消息的逻辑是，两个用户之间发送一条消息，有一个唯一的会话id，这个会话里可以有多条这两个用户的交互信息。
	通过一个用户id获取该用户的会话列表，再根据会话id再获取具体的会话内的多条消息。

	逻辑清楚之后，再加上一些附加功能，比如显示未读消息数量，根据时间顺序排列会话和消息。

	本节内容基本就是业务逻辑的开发，没有新增什么技术点，主要是前后端交互的逻辑比较复杂，前端的开发量也比较大。

## 新增点赞和点踩功能，使用Redis实现

	首先了解一下redis的基础知识，数据结构，jedis使用等。

	编写list，string，hashmap，set，sortset的测试用例，熟悉jedis api。

	开发点踩和点赞功能，在此之前根据业务封装好jedis的增删改查操作，放在util包中

	根据需求确定key字段，格式是 like：实体类型：实体id 和 dislike：实体类型：实体id 这样可以将喜欢一条新闻的人存在一个集合，不喜欢的存在另一个集合。通过统计数量可以获得点赞和点踩数。

	一般点赞点踩操作是先修改redis的值并获取返回值，然后再异步修改mysql数据库的likecount数值。这样既可以保证点赞操作快速完成，也可保证数据一致性。

	本次开发过程中遇到了请求超时的问题，经过排查之后是漏写了某个接口的服务，导致前端获取不到后端需要传的数据，而前端代码会不断检测这个数据的值以完成后续操作，导致页面无法完成解析。后来回滚到上一个版本后才发现bug所在并解决了该问题。

## 新增异步消息功能 新增邮件发送组件

	在之前的功能中有一些不需要实时执行的操作或者任务，我们可以把它们改造成异步消息来进行发送。

	具体操作就是使用redis来实现异步消息队列。代码中我们使用事件event来包装一个事件，事件需要记录事件实体的各种信息。

	我们在async包里开发异步工具类，事件生产者，事件消费者，并且开发一个eventhandler接口，让各种事件的实现类来实现这个接口。

	事件生产者一般作为一个服务，由业务代码进行调用产生一个事件。而事件消费者我们在代码里使用了单线程循环获取队列里的事件，并且寻找对应的handler进行处理。

	如此一来，整个异步事件的框架就开发完成了。后面新加入的登录，点赞等事件都可以这么实现。

	新增邮件功能，主要是引入mail依赖，并且配置好自己的邮箱信息，以及邮件模板，同时在业务代码中加入发邮件的逻辑即可。
