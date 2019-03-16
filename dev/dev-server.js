const path = require('path');
// __dirname：表示当前文件所在的目录的绝对路径
// __filename：表示当前文件的绝对路径
// 工作目录变更为当前文件所在目录的上一级，TODO 为什么呢？
// 牵涉引用：webpack-configure 对 package.json
process.chdir(path.join(__dirname, '../'));

const log4js = require('log4js');
const configure = require('mtf.devtools/webpack-configure');
const devServer = require('mtf.devtools/dev-server');

const logger = log4js.getLogger('dev-server');

// 默认无任何输出，需要自定义配置
log4js.configure({
  appenders: {
    'dev-server': {
      type: 'console', // console | file | dateFile | ...
      // type: 'dateFile',
      // filename: '../log/',
      // pattern: 'dev-server.yyyy-MM-dd.log',
      // alwaysIncludePattern: true,
    },
  },
  categories: {
    default: {
      appenders: ['dev-server'],
      level: 'all', // 能够输出的最低级别，all->trace->debug->info->warn->error->fatal->mark->off
    },
  },
});

logger.info('pid:', process.pid); // 进程id
logger.info('node:', process.version); // node版本
logger.info('platform:', process.platform); // 运行平台
logger.info('process execution path:', process.execPath); // 进程执行路径
logger.info('script working directory:', process.cwd()); // 运行当前脚本时所在的工作目录

const config = configure('dev', {
  entry: 'dev/index.js',
  html: 'dev/index.html',
});
const server = devServer(config);
const port = 3407;
logger.info(`listening on http://localhost:${port}`); // 进程id
server.localAt(port, [
  ['/(.*)', 'data/$1.json'],
]);
