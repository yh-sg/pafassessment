const morgan = require('morgan')
const express = require('express')
const bodyParser = require("body-parser")
const cors = require('cors')
const multer = require('multer');
const AWS = require('aws-sdk')
const fs = require('fs')
const mysql = require("mysql2/promise")
const CryptoJS = require("crypto-js");

const findAllUser = `select * from user`
const findUser = `select * from user where user_id = ? and password = ?`

require('dotenv').config();

const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

const app = express()

app.use(morgan('combined'))
app.use(cors());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.json({limit: '50mb'}))

const pool = mysql.createPool({
    host: process.env.MYSQL_SERVER,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_SCHEMA,
    connectionLimit: process.env.MYSQL_CONNECTION
});

const makeQuery = (sql, pool)=>{
    console.log(sql);
    return(async (args) => {
        const conn = await pool.getConnection();
        try{
            let results = await conn.query(sql,args||[])
            return results[0]
        }catch(err){
            console.log(err);
        }finally{
            conn.release();
        }
    })
}

const loginUser = makeQuery(findUser, pool)
const users = makeQuery(findAllUser, pool)

const startApp = async(app,pool) => {
    const conn = await pool.getConnection(); 
    try{
        console.log("test database connection...");
        await conn.ping();
		app.listen(PORT, () => {
			console.info(`Application started on port ${PORT} at ${new Date()}`)
		})
    }catch(e){
        console.log(e);
    }finally{
        conn.release();
    }
}

const AWS_S3_HOSTNAME = process.env.AWS_S3_HOSTNAME;
const AWS_S3_ACCESS_KEY = process.env.AWS_S3_ACCESS_KEY;
const AWS_S3_SECRET_ASSESSKEY = process.env.AWS_S3_SECRET_ASSESSKEY;
const AWS_S3_BUCKETNAME = process.env.AWS_S3_BUCKETNAME;

const spaceEndPoint = new AWS.Endpoint(AWS_S3_HOSTNAME);

const s3 = new AWS.S3({
    endpoint: spaceEndPoint,
    accessKeyId: AWS_S3_ACCESS_KEY,
    secretAccessKey: AWS_S3_SECRET_ASSESSKEY,
});

const upload = multer({
    dest: process.env.TMP_DIR || '/Users/yh/Desktop/NUS/paf-assessment-dec18-2020/temp'
})

app.get('/',(req,res)=>{
	users([]).then((results)=>{
        console.log(results);
        res.status(200).json({results});
	}).catch((err)=>{
        console.log(err);
        res.status(500).json(err)
    })
})

app.post('/login', (req,res)=>{
	const username = req.body.username
	const password = req.body.password
	let hash = CryptoJS.SHA1(password);
	let result = CryptoJS.enc.Hex.stringify(hash).toString();
	loginUser([username, result])
	.then((results)=>{
		if(results.length===0){
			console.log(results);
			return res.status(401).json(results)
		}
        res.status(200).json(results)
    }).catch((err)=>{
        console.log(err);
        res.status(500).json(err)
    })
})

app.post('/share', upload.single('tempimg'), async(req,res)=>{
	res.on('finish', () => {
		fs.unlink(req.file.path, () => { })
	})

	fs.readFile(req.file.path,(err, imgFile)=>{
        const params = {
            Bucket: AWS_S3_BUCKETNAME,
            Key: req.file.filename, 
            Body: imgFile,
            ACL: 'public-read',
            ContentType: req.file.mimetype,
            ContentLength: req.file.size
        }
		s3.putObject(params, (err, result)=>{})
		
		console.log(req.body.username);
		console.log(req.body.password);
		console.log(req.body.title);
		console.log(req.body.comments);
		res.status(200);
		res.type("application/json")
		res.json({
			message: "uploaded",
		})
	})
	// .catch(err=>{
    //     console.log(err);
    //     res.status(500)
    //     res.json(err)
    // })
})

startApp(app, pool)