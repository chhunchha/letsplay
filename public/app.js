angular.module('letsplay', []);

angular
    .module('letsplay')
    .controller('tennisCtrl', TennisCtrl);

TennisCtrl.$inject = ['$scope', '$http'];

function TennisCtrl($scope, $http) {
    var vm = this;
    vm.matches = [];
    vm.match = {};
    vm.search = { type: '', team1: [], team2: []};

    // Todo: get from db
    vm.players = ['Anand', 'Ashish', 'Shrikant', 'Sumant'];

    vm.tab_index = 0;

    vm.goToNewGame = function() {
        if (vm.tab_index == 0) return;
        vm.tab_index = 0;
    }

    vm.goToRecords = function() {
        if (vm.tab_index == 1) return;

        vm.getAllMatches();
        vm.tab_index = 1;
    }

    var initMatch = function() {
        vm.match = {
            type: 'Singles',
            date: new Date(),
            team1: [],
            team2: [],
            no_of_sets: 3,
            score: [],
            winner: []
        }
    }

    initMatch();

    vm.save_match = function() {

        // Todo: Do the checks
        addMatch();
    }

    var addMatch = function() {
        console.log(vm.match);
        $http.post('/matches', vm.match).then(function(response){
            initMatch();
        }, function(response){
            vm.handleError(response);
        });
    }

    vm.cancel = function() {
        initMatch();
    }

    vm.decide_winner = function() {
        var team1_game_wins = 0;
        var team2_game_wins = 0
        for (var i = 0; i < vm.match.no_of_sets; i++) {
            if (vm.match.score[i] == undefined) {
                vm.match.winner = '';
                return;
            }
            if (vm.match.score[i].team1 > vm.match.score[i].team2)
                team1_game_wins++;
            else if (vm.match.score[i].team1 < vm.match.score[i].team2)
                team2_game_wins++;
        }

        if (team1_game_wins > team2_game_wins)
            vm.match.winner = vm.match.team1;
        else if (team2_game_wins > team1_game_wins)
            vm.match.winner = vm.match.team2;
        else
            vm.match.winner = 'Draw';
    }

    var get_matches_url = '/get_matches';
    vm.getAllMatches = function() {
        $http.post(get_matches_url).then(function(response){
            vm.matches = response.data;
        }, function(response){
            vm.handleError(response);
        });
    }

    vm.getMatches = function() {
        $http.post(get_matches_url, vm.search).then(function(response){
            vm.matches = response.data;
        }, function(response){
            vm.matches = [];
        });
    }

    vm.clearFilter = function() {
        vm.search = {};
    }

    // vm.editMode = false;
    // vm.saveRecord = function() {
    //     if(vm.editMode) {
    //         vm.updateRecord();
    //     } else {
    //         vm.addRecord();
    //     }
    // }

    // vm.updateRecord = function() {
    //     $http.put('/records/' + vm.record._id, vm.record).then(function(response){
    //         vm.record = {};
    //         vm.getAllRecords();
    //         vm.editMode = false;
    //     }, function(response){
    //         vm.handleError(response);
    //     });
    // }

    // vm.editRecord = function(record) {
    //     vm.record = record;
    //     vm.editMode = true;
    // }
    //
    // vm.deleteRecord = function(recordid) {
    //     $http.delete('/records/'+recordid).then(function(response){
    //         console.log('Deleted');
    //         vm.getAllRecords();
    //     }, function(response){
    //         vm.handleError(response);
    //     })
    // }
    //
    // vm.cancelEdit = function() {
    //     vm.editMode = false;
    //     vm.record = {};
    //     vm.getAllRecords();
    // }


    vm.handleError = function(response) {
        console.log(response.status + ' - ' + response.statusText + ' - ' + response.data);
    }

    vm.getNumber = function(num) {
      return new Array(num);
    }
}
