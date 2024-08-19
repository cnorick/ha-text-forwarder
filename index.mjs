// Load the AWS SDK for Node.js
import "dotenv/config"
import { SNS } from "@aws-sdk/client-sns";
import express from "express";

const app = express();
app.use(express.json({strict: false})); 

app.post('/text-message', async (req, res) => {
  console.log({body: req.body});
  let { message, contacts } = req.body;
  contacts ??= [];

  message = Buffer(message, 'base64').toString('ascii')

  const iceContacts = process.env.ICE_PHONES.split(';').map(contact => contact.trim());
  const numbers = [];
  if (contacts.includes('ice')) {
    numbers.push(...[...iceContacts, process.env.SARAH_PHONE, process.env.NATHAN_PHONE])
  }
  else {
    if (contacts.includes('sarah')) {
      numbers.push(process.env.SARAH_PHONE)
    }
    if (contacts.includes('nathan')) {
      numbers.push(process.env.NATHAN_PHONE)
    }
    if (contacts.includes('garrett')) {
      numbers.push(process.env.GARRETT_PHONE)
    }
  }
  
  try {
    console.log(`received message: "${message}", numbers: ${numbers}`)
    await sendMessageToNumbers(message, numbers);
    res.send('success');
  }
  catch (e) {
    console.error(e);
    res.status(500).send(e)
  }
});

const port = 3000;
app.listen(port, () => {
 console.log(`Server is running at http://localhost:${port}`);
});

const sendMessageToNumbers = async (message, numbers) => {
  const phoneVal = numbers.map(n => `+ ${n}`).join(';');
  const publishTextPromise = new SNS({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  })
    .publish({
      Message: message,
      TopicArn: process.env.SNS_TOPIC_ARN,
      MessageAttributes: {
        phoneNumbers: {
          DataType: "String",
          StringValue: phoneVal
        }
      }
    }
  );

  await publishTextPromise
    .then(function (data) {
      console.log(
        `Message '${message}'\nsent to the numbers: ${phoneVal}`
      );
      console.log("MessageID is " + data.MessageId);
    })
    .catch(function (err) {
      console.error(err, err.stack);
    });
}
