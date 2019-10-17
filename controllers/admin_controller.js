//Reference File app.js
myApp.controller('admin_controller', function ($scope, $state, $http, $location, $timeout) {
    var vm = this;
  
    $scope.currentPage = $scope.activePage = 1;
    $scope.maxSize = 3;
    this.search_data = function (search_input) {
        if (search_input.length > 0)
            vm.loadData(1);

    };

    this.loadData = function (page_number) {
        var search_input = document.getElementById("search_input").value;
        $http.get('php/select.php?page=' + page_number + '&search_input=' + search_input).then(function (response) {
            vm.student_list = response.data.load_data;
            $scope.total_row = response.data.total;
            vm.pagenate(response);
            $timeout(function(){
                $("#"+ $scope.activePage).removeClass("inactive").addClass("active");
                $("#previous").addClass("disabled");

            });
        });
    };
    this.loadPage = function (page_number) {
        var search_input = document.getElementById("search_input").value;
        $http.get('php/select.php?page=' + page_number + '&search_input=' + search_input).then(function (response) {
            vm.student_list = response.data.load_data;
            $scope.total_row = response.data.total;
        });
    };

    $scope.$watch('currentPage + numPerPage', function () {

        vm.loadData($scope.currentPage);
        
        
        var begin = (($scope.currentPage - 1) * $scope.numPerPage)
                , end = begin + $scope.numPerPage;

    });
//    


vm.pagenate = function pagenate(response){
    $scope.pages = [];
    $scope.total_row = response.data.total;
    if (Number($scope.total_row[0][0]) >= 10){
        $scope.row = Number($scope.total_row[0][0]) / 10;
        $scope.row = Math.round($scope.row);
        if ( Number($scope.total_row[0][0]) % 10 < 0)
            $scope.total_pages = $scope.row + 1;
        else
            $scope.total_pages = $scope.row
    }
    else{
        $scope.total_pages = 1
    }

    for (var i = 0; i < $scope.total_pages; i++){
        if (i > 9)
            break;

        var page = {}
        page.no = i + 1;
        if (page.no == 1)
            page.active = true;
        else
            page.active = false;

        $scope.pages.push(page);
        
    }

}

    this.addStudent = function (info) {
        $http.post('php/insert.php', info).then(function (response) {
            vm.msg = response.data.message;
            vm.alert_class = 'custom-alert';
            document.getElementById("create_student_info_frm").reset();
            $('#create_student_info_modal').modal('toggle');
            vm.loadData($scope.currentPage);

        });
    };

    this.edit_student_info = function (student_id) {
        $http.get('php/selectone.php?load_id=' + student_id).then(function (response) {
            vm.student_info = response.data;
            
        });
    };


    this.updateStudent = function () {
        $http.put('php/update.php', this.student_info).then(function (response) {
            vm.msg = response.data.message;
            vm.alert_class = 'custom-alert';
            $('#edit_student_info_modal').modal('toggle');
            vm.loadData($scope.currentPage);
        });
    };


    this.get_student_info = function (student_id) {
        $http.get('php/selectone.php?load_id=' + student_id).then(function (response) {
            vm.view_student_info = response.data;

        });
    };


    this.delete_student_info = function (student_id) {
        $http.delete('php/delete.php?load_id=' + student_id).then(function (response) {
            vm.msg = response.data.message;
            vm.alert_class = 'custom-alert';
            vm.loadData($scope.currentPage);
            console.log(student_id);
        });
    };

    this.refresh = function () {
        $state.reload();
    };

    this.page_nav = function (pageno, total) {
        if (pageno == 0){
            if ($scope.activePage  == 1){
                return;
            }
            $scope.activePage--;
            vm.loadPage($scope.activePage);
        }
        else if (pageno == (total + 1)){
            if ($scope.activePage  == total){
                return;
            }
            $scope.activePage++;
            vm.loadPage($scope.activePage); 
        }
        else{
            vm.loadPage(pageno); 
            $scope.activePage = pageno;
        }

        for (var i = 0; i < $scope.pages.length; i++){
            var pg = i+1;
            
            if (pg == $scope.activePage){
                $("#"+ pg).removeClass("inactive").addClass("active");
            }
            else{
                $("#"+ pg).removeClass("active").addClass("inactive");
            }
            
        }

        if ($scope.activePage == 1){
            $("#previous").addClass("disabled");
        }
        else{
            $("#previous").removeClass("disabled");
        }
        if ($scope.activePage == total)
            $("#next").addClass("disabled");
        else{
            $("#next").removeClass("disabled");
        }    
        
    };
    

});

