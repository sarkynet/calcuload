//Reference File app.js
myApp.controller('calc_controller', function ($scope, $state, $http, $location) {
    var vm = this;
  
    $scope.applianceList = [];
    $scope.load = {};
    $scope.tarrif = 32.00;
    $scope.total_watts = 0;
    $scope.total_startups = 0;
    $scope.guest = {};
    $scope.text = "Double Backup";
    $scope.show_inverter = false;
    $scope.energy = false;
    
    
    this.search_data = function (search_input) {
        if (search_input.length > 0)
            vm.loadData();

    };
    
    this.loadData = function () {
        $http.get('php/select2.php').then(function (response) {
            vm.appliances = response.data.load_data;
            $scope.total_row = response.data.total;
        });
        
    };

    $scope.$watch('currentPage + numPerPage', function () {

        vm.loadData();

        var begin = (($scope.currentPage - 1) * $scope.numPerPage)
                , end = begin + $scope.numPerPage;

    });
//    

    this.add = function (data) {
        for (var i = 0; i < vm.appliances.length; i++){
            if(data.description == vm.appliances[i].description && data.wattage == vm.appliances[i].wattage){
                for(var j = 0; j < $scope.applianceList.length; j++){
                    if($scope.applianceList[j].description == data.description){
                        alert("This Appliance: " + data.description + " has already been added !");
                        return false;
                    }
                }
                vm.appliances[i].hours = data.hours;
                vm.appliances[i].qty = data.qty;
                $scope.applianceList.push(vm.appliances[i]);
                document.getElementById("create_info_form").reset();
                $scope.total_watts = vm.getTotalWatts($scope.applianceList);
                $scope.total_startups = vm.getTotalStartups($scope.applianceList);
                $scope.total_energy = approximate(vm.getTotalWattHours($scope.applianceList), 2);
                $scope.total_cost = approximate(eval($scope.total_energy * $scope.tarrif), 2);        
                return;
            }
            else if(data.description == vm.appliances[i].description && data.wattage != vm.appliances[i].wattage){
                vm.appliances[i].wattage = data.wattage;
                for(var j = 0; j < $scope.applianceList.length; j++){
                    if($scope.applianceList[j].description == data.description){
                        alert("This Appliance: " + data.description + " has already been added !");
                        return false;
                    }
                }
                vm.appliances[i].hours = data.hours;
                vm.appliances[i].qty = data.qty;
                $scope.applianceList.push(vm.appliances[i]);
                document.getElementById("create_info_form").reset();
                $scope.total_watts = vm.getTotalWatts($scope.applianceList);
                $scope.total_startups = vm.getTotalStartups($scope.applianceList);
                $scope.total_energy = approximate(vm.getTotalWattHours($scope.applianceList), 2);
                $scope.total_cost = approximate(eval($scope.total_energy * $scope.tarrif), 2);        
                return;
            }
            
        }
        data.startup = data.wattage;
        $scope.applianceList.push(data);
        document.getElementById("create_info_form").reset();
        $scope.total_watts = vm.getTotalWatts($scope.applianceList);
        $scope.total_startups = vm.getTotalStartups($scope.applianceList);
        $scope.total_energy = approximate(vm.getTotalWattHours($scope.applianceList), 2);
        $scope.total_cost = approximate(eval($scope.total_energy * $scope.tarrif), 2);        
    };

    this.append = function (data) {
        if (vm.appliances.length){
            for (var i = 0; i < vm.appliances.length; i++){
                if(data.description == vm.appliances[i].description){
                    $scope.load.wattage = vm.appliances[i].wattage;
                }
            }
        }
        
    };

    this.getTotalWatts = function (data) {
        var total = 0;
        for (var i = 0; i < data.length; i++){
            total += Number(data[i].wattage) * data[i].qty;
        }
        return total;
    };
    this.getTotalStartups = function (data) {
        var total = 0;
        for (var i = 0; i < data.length; i++){
            total += Number(data[i].startup)
        }
        return total;
    };
    this.getTotalWattHours = function (data) {
        var total = 0;
        for (var i = 0; i < data.length; i++){
            total += (data[i].hours * Number(data[i].wattage) * data[i].qty) / 1000;
        }
        return total;
    };
    this.getTotalEnergy = function (data) {
        var total = 0;
        for (var i = 0; i < data.length; i++){
            total = data * $scope.tarrif;
        }
        return total;
    };


    this.suggest = function () {
        $scope.show_inverter = true;
        $scope.total_va = $scope.total_watts / 0.8;
        if ($scope.total_va == 0){
            $scope.guest.inverter = "N/A"
        }
        if ($scope.total_va < 600 && $scope.total_va >= 100){
            $scope.guest.inverter = "1000VA - 1KVA";
            $scope.guest.inverter_volts = 12;
            $scope.guest.battery_cap = Number($scope.guest.battery_cap);
            if ($scope.guest.battery_cap <= 200){
                $scope.guest.nob = eval( $scope.guest.inverter_volts / 12);
                if ($scope.guest.charge_type == "Normal"){
                    $scope.guest.panel_cap = 250;
                   
                }
                else if ($scope.guest.charge_type == "High"){
                    $scope.guest.panel_cap = 500
                }
            }
            else if ($scope.guest.battery_cap > 200){
                $scope.guest.nob = eval( $scope.guest.inverter_volts / 2);
                if ($scope.guest.charge_type == "Normal"){
                    $scope.guest.panel_cap = 750;
                   
                }
                else if ($scope.guest.charge_type == "High"){
                    $scope.guest.panel_cap = 1500
                }
            }     

            $scope.guest.panel_capkw = $scope.guest.panel_cap / 1000;
            $scope.guest.backup_time = ($scope.guest.inverter_volts * $scope.guest.battery_cap * 0.7) / $scope.total_watts
            $scope.guest.backup_time = Math.round($scope.guest.backup_time);
            $scope.guest.cost = "N290,000.00";
        }
        if ($scope.total_va < 1600 && $scope.total_va >= 600){
            $scope.guest.inverter = "2000VA - 2KVA";
            $scope.guest.inverter_volts = 24;
            $scope.guest.battery_cap = Number($scope.guest.battery_cap);
            if ($scope.guest.battery_cap <= 200){
                $scope.guest.nob = eval( $scope.guest.inverter_volts / 12);
                if ($scope.guest.charge_type == "Normal"){
                    $scope.guest.panel_cap = 500;
                   
                }
                else if ($scope.guest.charge_type == "High"){
                    $scope.guest.panel_cap = 1000
                }
            }
            else if ($scope.guest.battery_cap > 200){
                $scope.guest.nob = eval( $scope.guest.inverter_volts / 2);
                if ($scope.guest.charge_type == "Normal"){
                    $scope.guest.panel_cap = 1500;
                   
                }
                else if ($scope.guest.charge_type == "High"){
                    $scope.guest.panel_cap = 3000
                }
            }     

            $scope.guest.panel_capkw = $scope.guest.panel_cap / 1000;
            $scope.guest.backup_time = ($scope.guest.inverter_volts * $scope.guest.battery_cap * 0.7) / $scope.total_watts
            $scope.guest.backup_time = Math.round($scope.guest.backup_time);
            $scope.guest.cost = "N630,000.00";
        }
        if ($scope.total_va < 3000 && $scope.total_va >= 1600){
            $scope.guest.inverter = "3500VA - 3.5KVA";
            $scope.guest.inverter_volts = 48;
            $scope.guest.battery_cap = Number($scope.guest.battery_cap);
            if ($scope.guest.battery_cap <= 200){
                $scope.guest.nob = eval( $scope.guest.inverter_volts / 12);
                if ($scope.guest.charge_type == "Normal"){
                    $scope.guest.panel_cap = 1000;
                   
                }
                else if ($scope.guest.charge_type == "High"){
                    $scope.guest.panel_cap = 3000
                }
            }
            else if ($scope.guest.battery_cap > 200){
                $scope.guest.nob = eval( $scope.guest.inverter_volts / 2);
                if ($scope.guest.charge_type == "Normal"){
                    $scope.guest.panel_cap = 4000;
                   
                }
                else if ($scope.guest.charge_type == "High"){
                    $scope.guest.panel_cap = 6000
                }
            }     

            $scope.guest.panel_capkw = $scope.guest.panel_cap / 1000;
            $scope.guest.backup_time = ($scope.guest.inverter_volts * $scope.guest.battery_cap * 0.7) / $scope.total_watts
            $scope.guest.backup_time = Math.round($scope.guest.backup_time);
            $scope.guest.cost = "N1,250,000.00";
        }
        if ($scope.total_va < 4500 && $scope.total_va >= 3000){
            $scope.guest.inverter = "5000VA - 5KVA";
            $scope.guest.inverter_volts = 96;
            $scope.guest.battery_cap = Number($scope.guest.battery_cap);
            if ($scope.guest.battery_cap <= 200){
                $scope.guest.nob = eval( $scope.guest.inverter_volts / 12);
                if ($scope.guest.charge_type == "Normal"){
                    $scope.guest.panel_cap = 2000;
                   
                }
                else if ($scope.guest.charge_type == "High"){
                    $scope.guest.panel_cap = 4000
                }
            }
            else if ($scope.guest.battery_cap > 200){
                $scope.guest.nob = eval( $scope.guest.inverter_volts / 2);
                if ($scope.guest.charge_type == "Normal"){
                    $scope.guest.panel_cap = 6000;
                   
                }
                else if ($scope.guest.charge_type == "High"){
                    $scope.guest.panel_cap = 9000
                }
            }     

            $scope.guest.panel_capkw = $scope.guest.panel_cap / 1000;
            $scope.guest.backup_time = ($scope.guest.inverter_volts * $scope.guest.battery_cap * 0.7) / $scope.total_watts
            $scope.guest.backup_time = Math.round($scope.guest.backup_time);
            $scope.guest.cost = "N2,180,000.00";
        }
        if ($scope.total_va < 9000 && $scope.total_va >= 4500){
            $scope.guest.inverter = "10000VA - 10KVA";
            $scope.guest.inverter_volts = 120;
            $scope.guest.battery_cap = Number($scope.guest.battery_cap);
            if ($scope.guest.battery_cap <= 200){
                $scope.guest.nob = eval( $scope.guest.inverter_volts / 12);
                if ($scope.guest.charge_type == "Normal"){
                    $scope.guest.panel_cap = 3000;
                   
                }
                else if ($scope.guest.charge_type == "High"){
                    $scope.guest.panel_cap = 5000
                }
            }
            else if ($scope.guest.battery_cap > 200){
                $scope.guest.nob = eval( $scope.guest.inverter_volts / 2);
                if ($scope.guest.charge_type == "Normal"){
                    $scope.guest.panel_cap = 10000;
                   
                }
                else if ($scope.guest.charge_type == "High"){
                    $scope.guest.panel_cap = 15000
                }
            }     

            $scope.guest.panel_capkw = $scope.guest.panel_cap / 1000;
            $scope.guest.backup_time = ($scope.guest.inverter_volts * $scope.guest.battery_cap * 0.7) / $scope.total_watts
            $scope.guest.backup_time = Math.round($scope.guest.backup_time);
            $scope.guest.cost = "N3,560,000.00";
        }
    };


    this.double_backup = function () {
        if ($scope.text == "Double Backup"){
            $scope.guest.nob = $scope.guest.nob * 2;
            $scope.guest.backup_time = ($scope.guest.inverter_volts * $scope.guest.battery_cap * 2 * 0.7) / $scope.total_watts
            $scope.guest.backup_time = Math.round($scope.guest.backup_time);
            $scope.text = "Undo Double Backup";
        }
        if ($scope.text == "Undo Double Backup"){
            $scope.guest.nob = $scope.guest.nob / 2;
            $scope.guest.backup_time = ($scope.guest.inverter_volts * $scope.guest.battery_cap * 0.7) / $scope.total_watts
            $scope.guest.backup_time = Math.round($scope.guest.backup_time);
            $scope.text = "Double Backup";
        }
    };


    this.get_student_info = function (student_id) {
        $http.get('php/selectone.php?load_id=' + student_id).then(function (response) {
            vm.view_student_info = response.data;

        });
    };


    this.delete_info = function (data) {
        for(var j = 0; j < $scope.applianceList.length; j++){
            if($scope.applianceList[j].description == data.description){
                $scope.applianceList.splice($scope.applianceList.indexOf(data), 1);
                $scope.total_watts = vm.getTotalWatts($scope.applianceList);
                $scope.total_startups = vm.getTotalStartups($scope.applianceList);
                $scope.total_energy = vm.getTotalWattHours($scope.applianceList);
                $scope.total_cost = $scope.total_energy * $scope.tarrif;
            }
        }
    };
    function approximate(val, decimalplaces){
        var final = '', value = '', result = '';
        var addOne = false; 
        value += val;
        for(var i = 0; i < value.length; i++){
            if(value[i] === "."){
                var de = value.slice(value.indexOf('.')+1);
                var num = value.slice(0, value.indexOf('.'));
                var arr = de.split("");
                var length = arr.length - 1;
                for(var j = length; j >= decimalplaces;  j--){
                    arr[j] = Number(arr[j]);
                    if(arr[j] < 5)
                        continue;
                    
                    if (arr[j] >= 9 )
                        arr[j] = 0;
                    arr[j] = 0;
                    arr[j-1] = Number(arr[j-1]) + 1;
                }
                for(var i = length; i >= 0;  i--){
                    arr[i] = Number(arr[i]);
                        if(arr[i] < 5)
                            continue;
                        
                        if (i != 0 && arr[i] == 10 ){
                            arr[i] = 0;
                            arr[i-1] = Number(arr[i-1]) + 1;
                        }
                }
            
                if (arr[0] == 10){
                    arr[0] = 0;
                    addOne = true;
                }
                arr = arr.toString();
                for(var i = 0; i < arr.length; i++){
                    if(arr[i] === ",")
                        continue;

                    final += arr[i];
                }
                de = final.slice(0, decimalplaces);
                if (addOne){
                    num = Number(num) + 1;
                    num = num.toString();
                }
                result = num.concat(".", de);
                return Number(result);
            }
        }
        return Number(value);
    }

    this.refresh = function () {
        $state.reload();
    };

    var Proucts = [{"Batteries": [
        {"100AH": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"150AH": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"200AH": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"500AH": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"650AH": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"1000AH": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"1500AH": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        }]
    },
    {"Panels": [
        {"80W": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"100W": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"130W": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"150W": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"160W": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"200W": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"250W": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"270W": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"300W": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"325W": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"350W": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        },
        {"400W": [
            {"Low": 40000, "High": 60000, "Country": "China"},
            {"Low": 40000, "High": 60000, "Country": "India"},
            {"Low": 40000, "High": 60000, "Country": "Europe"}]
        }]
    },
    {"Controllers": [
        {"MPPT": [
            {"10A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"15A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"20A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"25A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"30A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"40A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"45A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"50A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"60A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"80A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            }]
        },
        {"PWM": [
            {"10A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"15A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"20A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"25A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"30A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"40A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"45A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"50A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"60A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            },
            {"80A": [
                {"Low": 40000, "High": 60000, "Country": "China"},
                {"Low": 40000, "High": 60000, "Country": "India"},
                {"Low": 40000, "High": 60000, "Country": "Europe"}]
            }]
        }]
    },
    {"Inverters": [
        {"500VA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"650VA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"800VA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"850VA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"900VA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"1KVA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"1.5KVA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"2KVA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"2.5KVA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"3KVA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"3.5KVA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"5KVA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"10KVA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"15KVA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"20KVA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        },
        {"30KVA": [
            {"Normal": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            },
            {"Hybrid": [
                {"Low": 40000, "High": 60000, "Country": "China", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "India", "volts": "12v"},
                {"Low": 40000, "High": 60000, "Country": "Europe", "volts": "12v"}]
            }]
        }]
    }]

});

