(function() {
  freeboard.loadDatasourcePlugin({
    "type_name"   : "BCSIMS",
    "display_name": "BCSIMS",
    "description" : "This API is tracks earthquakes around BC.",
    "settings"    : [
    {
      "name"         : "magnitude",
      "display_name" : "Magnitude",
      "type"         : "number",
    },
    {
      "name"         : "startDate",
      "display_name" : "Start Date",
      "description"  : "Format: yyyy-mm-dd",
      "default_value": "2016-02-20",
      "type"         : "text"
    },
    {
      "name"         : "endDate",
      "display_name" : "End Date",
      "description"  : "Format: yyyy-mm-dd",
      "default_value": "2016-03-20",
      "type"         : "text"
    },
    {
      "name"         : "refresh_time",
      "display_name" : "Refresh Time",
      "type"         : "text",
      "description"  : "In milliseconds",
      "default_value": 5000
    }
    ],
    newInstance: function(settings, newInstanceCallback, updateCallback) {
      newInstanceCallback(new myDatasourcePlugin(settings, updateCallback));
    }
  });

  var myDatasourcePlugin = function(settings, updateCallback) {
    var vm = this;

    var currentSettings = settings;

    function getData() {
      var data;
      var url = "http://www.bcsims.ca/WSContent.asmx/LoadAllEarthquakes";
      var start = currentSettings.startDate.split("-");
      var startDate = new Date(start[2], start[1] - 1, start[0]);
      var end = currentSettings.endDate.split("-");
      var endDate = new Date(end[2], end[1] - 1, end[0]);
      var body = {
        startdate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        magnitude: currentSettings.magnitude
      };
      $.ajax({
        url: url,
        type: 'POST',
        body: JSON.stringify(body),
        success: function(results) {
          updateCallback(results);
        },
        error: function(error) {
          console.log(error);
        }
      });
    }

    var refreshTimer;

    function createRefreshTimer(interval) {
      if(refreshTimer) {
        clearInterval(refreshTimer);
      }

      refreshTimer = setInterval(function() {
        getData();
      }, interval);
    }

    vm.onSettingsChanged = function(newSettings) {
      currentSettings = newSettings;
    }

    vm.updateNow = function() {
      getData();
    }

    vm.onDispose = function() {
      clearInterval(refreshTimer);
      refreshTimer = undefined;
    }

    createRefreshTimer(currentSettings.refresh_time);
  }

  freeboard.loadWidgetPlugin({
    "type_name"   : "511 Plugin",
    "display_name": "511 Test Plugin",
    "description" : "A plugin for viewing 511 data",
    "fill_size" : false,
    "settings"    : [
    {
      "name"        : "the_text",
      "display_name": "Some Text",
      // We'll use a calculated setting because we want what's displayed in this widget to be dynamic based on something changing (like a datasource).
      "type"        : "calculated"
    },
    {
      "name"        : "size",
      "display_name": "Size",
      "type"        : "option",
      "options"     : [
      {
        "name" : "Regular",
        "value": "regular"
      },
      {
        "name" : "Big",
        "value": "big"
      }
      ]
    }
    ],
    newInstance: function(settings, newInstanceCallback) {
      newInstanceCallback(new myWidgetPlugin(settings));
    }
  });

  var myWidgetPlugin = function(settings) {
    var vm = this;
    var currentSettings = settings;

    var myTextElement = $("<span></span>");

    vm.render = function(containerElement) {
      $(containerElement).append(myTextElement);
    }

    vm.getHeight = function() {
      if(currentSettings.size === "big") {
        return 2;
      } else {
        return 1;
      }
    }

    vm.onSettingsChanged = function(newSettings) {
      currentSettings = newSettings;
    }

    vm.onCalculatedValueChanged = function(settingName, newValue) {
      if(settingName === "the_text") {
        $(myTextElement).html(newValue);
      }
    }

    vm.onDispose = function() { }
  }
}());
