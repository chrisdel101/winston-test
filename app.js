var express = require('express')
var expressWinston = require('express-winston')
var winston = require('winston') // for transports.Console
var bodyParser = require('body-parser') // for transports.Console
var methodOverride = require('method-override') // for transports.Console
var app = (module.exports = express())

app.use(bodyParser())
app.use(methodOverride())

// Let's make our express `Router` first.
var router = express.Router()
router.get('/error', function (req, res, next) {
  // here we cause an error in the pipeline so we see express-winston in action.
  return next(
    new Error('This is an error and it should be logged to the console')
  )
})

router.get('/', function (req, res, next) {
  res.write('This is a normal request, it should be logged to the console too')
  res.end()
})

// express-winston logger makes sense BEFORE the router
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
  })
)

// Now we can tell the app to use our routing code:
app.use(router)

// express-winston errorLogger makes sense AFTER the router.
app.use(
  expressWinston.errorLogger({
    transports: [
      new winston.transports.File({
        filename: 'error.log',
        level: 'error',
      }),
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
  })
)
console.log('ehllo')

// Optionally you can include your custom error handler after the logging.
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500)
  // render the error page
})

app.listen(3000, function () {
  console.log(
    'express-winston demo listening on port %d in %s mode',
    this.address().port,
    app.settings.env
  )
})
