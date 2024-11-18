function doPost(e) {
  // let sheet = SpreadsheetApp.getActive().getActiveSheet();
  // sheet.appendRow([new Date(), e.postData.contents]);
  let data = JSON.parse(e.postData.contents);//LINEから来たjsonデータをJavascriptのオブジェクトに変換する
  let events = data.events;
  for(let i = 0; i < events.length; i++){
    let event = events[i];
    if(event.type == 'message'){
      if(event.message.type == 'text'){
        // let translatedText = LanguageApp.translate(event.message.text,'ja','en');//英訳
        if(event.message.text =="部室"){
          //送信するデータを作成する
          let replycontent = fetchSesameHistoryAndInterpret();
          let contents2 ={
            replyToken: event.replyToken,
            messages: [{type: 'text',text: replycontent}],
          };
          reply(contents2);
        }
      }
    }
  }
}

function reply(contents){
  var scriptProperties = PropertiesService.getScriptProperties();
  let channelAccessToken = scriptProperties.getProperty('token');
  let replyUrl = "https://api.line.me/v2/bot/message/reply"; // LINE にデータを送り返すときに使う URL
  let options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + channelAccessToken
    },
    payload: JSON.stringify(contents) // リクエストボディは payload に入れる
  };
  UrlFetchApp.fetch(replyUrl, options); 
}
