function fetchSesameHistoryAndInterpret() {
  // スクリプトプロパティからAPIキーとSesame UUIDを取得
  var scriptProperties = PropertiesService.getScriptProperties();
  var apiKey = scriptProperties.getProperty('key');
  var sesameUUID = scriptProperties.getProperty('uuid');

  // 履歴を取得するAPIエンドポイント
  var endpoint = 'https://app.candyhouse.co/api/sesame2/' + sesameUUID + '/history?page=0&lg=2';

  // HTTPリクエストのオプション設定
  var options = {
    'method': 'get',
    'headers': {
      'x-api-key': apiKey
    },
    'muteHttpExceptions': true
  };

  // HTTP GETリクエストの実行
  var response = UrlFetchApp.fetch(endpoint, options);
  var statusCode = response.getResponseCode();
  var content = response.getContentText();

  Logger.log(content);

  // レスポンスの解析
  if (statusCode === 200) {
    var history = JSON.parse(content);
    //historyには過去２操作の履歴があるが，最新のもののみを確認する（history[0]を確認）
    var entry = history[0];
    var description = interpretSesameType(entry.type);
    var timestamp  = convertTimestamp(entry.timeStamp);
    Logger.log('Event: ' + description + ', Time: ' + timestamp);

    if(entry.type == 1){//最後の操作が施錠
      Logger.log('誰もいなさそう。')
      return('誰もいなさそう。');
    }else if(entry.type == 2){//最後の操作が解錠
      Logger.log('誰かいるかも！')
      return('誰かいるかも！');
    }else{
      Logger.log('管理者まで確認を'+ description);
      return('管理者まで確認を'+description);
    }
    
  } else {
    Logger.log('Error fetching history. Status code: ' + statusCode + ' - Response: ' + content);
    return('管理者まで確認を\n'+'Error fetching history. Status code: ' + statusCode + ' - Response: ' + content)
  }
}

//イベントtypeをチェック
function interpretSesameType(type) {
  var typeDescriptions = {
    0: 'none',
    1: 'bleLock - セサミデバイスが施錠のBLEコマンドを受付ました。',
    2: 'bleUnLock - セサミデバイスが解錠のBLEコマンドを受付ました。',
    3: 'timeChanged - セサミデバイスの内部時計が校正されました。',
    4: 'autoLockUpdated - オートロックの設定が変更されました。',
    5: 'mechSettingUpdated - 施解錠角度の設定が変更されました。',
    6: 'autoLock - セサミデバイスがオートロックしました。',
    7: 'manualLocked - 手動で施錠しました。',
    8: 'manualUnlocked - 手動で解錠しました。',
    9: 'manualElse - 解錠または施錠の範囲から、サムターンに動きがあった場合',
    10: 'driveLocked - モーターが確実に施錠しました。',
    11: 'driveUnlocked - モーターが確実に解錠しました。',
    12: 'driveFailed - モーターが施解錠の途中で失敗しました。',
    13: 'bleAdvParameterUpdated - BLEアドバタイシングの設定が変更されました。',
    14: 'wm2Lock - Wifiモジュールを経由して施錠しました。',
    15: 'wm2Unlock - Wifiモジュールを経由して解錠しました。',
    16: 'webLock - Web APIを経由して施錠しました。',
    17: 'webUnlock - Web APIを経由して解錠しました。'
  };

  return typeDescriptions[type] || '未知のイベントタイプ';
}

//タイムスタンプを時間表記に変更
function convertTimestamp(timestamp) {
  var date = new Date(timestamp);
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm:ss');
}
