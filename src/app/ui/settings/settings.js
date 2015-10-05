"use strict";

angular.module('cmod.ui.settings', [])
.factory('settings', ['$rootScope', function($rootScope) {

  var settings = {
    vu: true,
    repeat: false,
    shuffle: false,
    moddir: process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/modules',
    _lastPlaylist: []
  };

  var localSettings = window.localStorage.getItem('settings');
  if(localSettings) {
    var parsedSettings = JSON.parse(localSettings);
    for(var key in parsedSettings) {
      if(typeof parsedSettings[key] !== 'undefined') {
        settings[key] = parsedSettings[key];
      }
    }
  }

  function setSetting(key, value) {
      settings[key] = value;
      window.localStorage.setItem('settings', angular.toJson(settings));
      $rootScope.$broadcast(key+'changed');
  }

  function getSetting(key) {
    return settings[key];
  }

  return {
    set: setSetting,
    get: getSetting
  };
}])
.controller('cmodSettingsCtrl', [
          'settings', '$scope',
  function(settings,   $scope) {

    $scope.vuDisabled = !settings.get('vu');
    $scope.repeat = settings.get('repeat');
    $scope.shuffle = settings.get('shuffle');
    $scope.basedir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    $scope.moddir = settings.get('moddir');

    $scope.hideVU = function() {
      settings.set('vu', !$scope.vuDisabled);
    };

    $scope.repeatPlaylist = function() {
      settings.set('repeat', $scope.repeat);
    };

    $scope.shufflePlaylist = function() {
      settings.set('shuffle', $scope.shuffle);
    };

    var chooser = document.querySelector('#destPathInputHidden');
    chooser.addEventListener("change", function(evt) {
      $scope.moddir = this.value;
      settings.set('moddir', this.value);
    }, false);

    $scope.changeModDir = function() {
      chooser.click();
    };

}]);