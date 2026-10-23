/* Compatibility entry point for the former deployment after a verified cutover. */
function migrationProxy_(event, method) {
  try {
    var target = PropertiesService.getScriptProperties().getProperty('IENEKO_MIGRATION_TARGET');
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(target || '')) {
      throw Error('migration_target_not_configured');
    }
    var e = event || {}, params = e.parameter || {}, query = e.queryString || '';
    if (!query) {
      var all = e.parameters || params;
      query = Object.keys(all).reduce(function(parts, key) {
        var values = Array.isArray(all[key]) ? all[key] : [all[key]];
        values.forEach(function(value) { parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value)); });
        return parts;
      }, []).join('&');
    }
    var options = {method: method, followRedirects: true, muteHttpExceptions: true};
    if (method === 'post') {
      options.contentType = e.postData && e.postData.type || 'text/plain';
      options.payload = e.postData && e.postData.contents || '';
    }
    var response = UrlFetchApp.fetch(target + (query ? '?' + query : ''), options);
    if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
      throw Error('migration_upstream_http_' + response.getResponseCode());
    }
    var output = ContentService.createTextOutput(response.getContentText()), type = '';
    var headers = response.getHeaders();
    Object.keys(headers).forEach(function(key) { if (key.toLowerCase() === 'content-type') type = String(headers[key]).toLowerCase(); });
    if (type.indexOf('javascript') >= 0) return output.setMimeType(ContentService.MimeType.JAVASCRIPT);
    if (type.indexOf('csv') >= 0) {
      var filename = params.mode === 'beta-csv' ? 'ieneko-five-towns-synthetic.csv' : params.proof === '1' ? 'ieneko-cats-verification.csv' : 'ieneko-cats.csv';
      return output.setMimeType(ContentService.MimeType.CSV).downloadAsFile(filename);
    }
    return output.setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ok: false, service: 'ienekomap2-migration', error: String(error.message || error)})).setMimeType(ContentService.MimeType.JSON);
  }
}
