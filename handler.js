'use strict';
let crypto = require('crypto');
let AWS = require('aws-sdk');

let polly = new AWS.Polly();
let s3 = new AWS.S3();

module.exports.polly = async (event, context) => {
  let hash = crypto
    .createHash('md5')
    .update(event.body)
    .digest('hex');
  let params = {
    LexiconNames: [],
    OutputFormat: 'mp3',
    SampleRate: '8000',
    Text: event.body,
    TextType: 'text',
    VoiceId: 'Joey',
  };

  let pollyResponse = await polly.synthesizeSpeech(params).promise();

  let stream = pollyResponse.AudioStream;

  let s3Params = {
    ACL: 'public-read',
    Body: stream,
    Bucket: process.env['DOWNLOAD_BUCKET'],
    Key: hash + '.mp3',
  };
  let s3Response = await s3.putObject(s3Params).promise();

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      download:
        'http://' +
        process.env['DOWNLOAD_BUCKET'] +
        '.s3-website-ap-southeast-2.amazonaws.com/' +
        hash +
        '.mp3',
    }),
  };
};
