"use strict";

angular.module('cmod.ui.playlist', [
  'cmod.player',
  'cmod.playerState'
])
.controller('cmodPlaylistCtrl',
  [         'nwgui', 'player', 'state', '$rootScope', '$scope',
    function(nwgui, player, state, $rootScope, $scope) {
      console.log("playlist ctrl!"); // TODO: executed twice?

      $scope.state = state;

      $scope.addSongToPlaylist = function(name, path) {
        console.log("adding song...");
        player.metadataFromFile(path, function(metadata) {
          console.log(metadata);
          $scope.$apply(function() {
            var minutes = Math.floor(metadata.duration/60);
            var seconds = Math.round(metadata.duration - minutes * 60);
            state.playlist.push({
              'name': metadata.title,
              'filename': name,
              'path': path,
              'duration': minutes + ":" + (("0" + seconds).substr(-2, 2)),
              'metadata': metadata
            });
          });
        });
      };

      $scope.playSongInPlaylist = function(i) {
        state.current_song = state.playlist[i].path;
        state.current_song_index = i;
        state.metadata = state.playlist[i].metadata;
        console.log(state.metadata);
        player.loadAndPlay(state.playlist[i].path);
      };

      $scope.removeSongFromPlaylist = function() {
        state.playlist.splice(state.current_song_index_context_menu, 1);
      };

      $scope.removeAllSongsFromPlaylist = function() {
        state.playlist = [];
      };


      $scope.ondrop = function(e) {
        this.className = '';
        e.preventDefault();
        // all files
        var files = e.dataTransfer.files;
        var entries = e.dataTransfer.items;
        var num_files = files.length;
        if(num_files > 0) {
          for (var i = 0; i < num_files; ++i) {
            if(entries[i].webkitGetAsEntry().isDirectory) {
              console.log("scanning directory: " + files[i].path);
              var emitter = require('walkdir')(files[i].path);
              emitter.on('file', function(path, stat) {
                if(player.isFormatSupported(path)) {
                  $scope.$apply(function() {
                    var name = path.replace(/^.*[\\\/]/, '');
                    $scope.addSongToPlaylist(name, path);
                  });
                }
              });
            } else {
              var name = files[i].name;
              if(player.isFormatSupported(name)) {
                var size = files[i].size;
                $scope.$apply(function() {
                  var path = files[i].path;
                  $scope.addSongToPlaylist(name, path);
                });
              }

            }
          }
        }
        return false;
      }

      // prevent default behavior from changing page on dropped file
      var holder = document.body;
      window.ondragover = function(e) { e.preventDefault(); return false };
      window.ondrop = function(e) { e.preventDefault(); return false };
      holder.ondragover = function () { this.className = 'hover'; return false; };
      holder.ondragleave = function () { this.className = ''; return false; };
      holder.ondrop = $scope.ondrop;




      var menu = new nwgui.Menu();
      menu.append(new nwgui.MenuItem({ label: 'Remove' }));
      menu.append(new nwgui.MenuItem({ label: 'Remove all' }));
      menu.append(new nwgui.MenuItem({ type: 'separator' }));
      menu.append(new nwgui.MenuItem({ label: 'Info' }));
      menu.items[0].click = function() {
        $scope.$apply(function() {
          $scope.removeSongFromPlaylist();
        });
      };
      menu.items[1].click = function() {
        $scope.$apply(function() {
          $scope.removeAllSongsFromPlaylist();
        });
      };
      menu.items[3].click = function() {
        console.log("info " + state.current_song_index_context_menu);
      };
      $scope.showOptions = function($index, $event) {
        state.current_song_index_context_menu = $index;
        menu.popup($event.pageX, $event.pageY);
      };

}]);