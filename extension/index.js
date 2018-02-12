(function() {

  function saveSupportedSites(supportedSites, last_checked){
    chrome.storage.sync.set({
      'last_checked': last_checked,
      'supportedSites': supportedSites
    });
  }

  function saveStyles(domain, styleElement) {
    var obj = {};
    obj[domain] = styleElement.innerHTML;
    chrome.storage.sync.set(obj);
  };

  function updateAndSaveStyles(domain, styleElement, css) {
    styleElement.innerHTML = css;
    saveStyles(domain, styleElement);
  }

  function getDomainStyles(domain, styleElement){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `https://s3.amazonaws.com/fowm/styles/${domain}.css`, false);
    xhr.send();
    if (xhr.status === 200) {
      updateAndSaveStyles(domain, styleElement, xhr.responseText)
    }
  }

  function getSupportedSites(storageCache) {
    var last_checked = storageCache["last_checked"],  d = new Date(), checkDay = d.getDate();
    // refresh supported sites list once per day
    if (checkDay != last_checked) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", 'https://s3.amazonaws.com/fowm/supportedsites.json', false);
      xhr.send()
      if (xhr.status === 200) {
        saveSupportedSites(JSON.parse(xhr.responseText), checkDay)
      }
    }
  };

  function init(storageCache, domain) {
    var head = document.getElementsByTagName('head')[0];
    var styleElement = document.createElement('style');
    head.appendChild(styleElement);

    if (storageCache["supportedSites"] === undefined) {
      getSupportedSites(storageCache);
      run(); // RECURSIVENESS can do unlimited loop, fix
      return;
    }else {
      if (storageCache["supportedSites"].indexOf(domain) !== -1) {
        // DOMAIN SUPPORTED
        if(storageCache[domain] !== undefined) {
          // DOMAIN CSS CACHED, USE AND QUIT
          styleElement.innerHTML = storageCache[domain];
        } else {
          // DOMAIN SUPPORTED, CSS NOT CACHED, GET CSS
          getDomainStyles(domain, styleElement);
        }
      } else {
        // DOMAIN NOT SUPPORTED
      }
    }
  }

  function run(){
    domain = window.location.hostname;
    chrome.storage.sync.get(null, function(data) {
      init(data, domain);
    });
  }

  // ESHGETIT
  run();

}());
