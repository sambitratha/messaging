var app = angular.module('rdc', ['ngMessages']);

app.filter("trust", ['$sce', function($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  }
}]);

function updateDept($scope,$http){
  $http({
    method: "POST",
    url: '/getDept'
  }).then(function mySuccess(res){
    $scope.deptForSync = res.data.depts;
  }, function myError(res){
    alert(res.statusText);
  });
}

function updateUsers($scope,$http){
  $http({
    method: "POST",
    url: '/getAllUsers'
  }).then(function mySuccess(res){
    if(res.data) $scope.allUsers = res.data;
  }, function myError(res){
    alert(res.statusText);
  });
}

function updateReportingManagers($scope,$http){
  $http({
    method : "POST",
    url : '/getReporteesByUID',
    data : {uid:'02329Q744'}
  }).then(function mySuccess(res){
      if(res.data.status){
        $scope.managers = res.data.reportees;
      }
      else {
        alert('status was false');
        alert(res.data.err);
      }

  } , function myError(res){
    alert('Error in response');
    alert(res.statusText);
  });
}


app.controller('sync', function($scope , $http) {

  $scope.nu = {};
  $scope.allUsers = [];
  $scope.isVendor = false;
  $scope.isLOA = false;
  $scope.newDept = "";
  $scope.managers = [];
  updateDept($scope,$http);
  updateUsers($scope,$http);
  updateReportingManagers($scope,$http);

  $scope.startSync = function() {
    $http({
      method: "POST",
      url: '/sync'
    }).then(function mySuccess(res){
      $scope.addUsers = res.data.addUsers;
      $scope.removeUsers = res.data.removeUsers;
    }, function myError(res){
      alert('Error occured');
      alert(res.statusText);
    });
  }

  $scope.addDept = function(){
    var dept = $scope.newDept;

    if(/^\s*$/.test(dept)) {
      $scope.deptMsg = '<span style="color:red">Enter a department</span>';
    } else {
      $http({
        method: "POST",
        url: '/addDept',
        data: {dept: dept}
      }).then(function mySuccess(res){
        if(res.data){
          $scope.newDept = "";
          updateDept($scope,$http);
          $scope.deptMsg = '<span style="color:green">"'+dept+'" added</span>';
        } else {
          $scope.deptMsg = '<span style="color:red">"'+dept+'" already exists</span>';
        }
      }, function myError(res){
        alert(res.statusText);
      });
    }

  }

  $scope.deleteDept = function(dept){
    $http({
      method: "POST",
      url: '/deleteDept',
      data: {dept: dept}
    }).then(function mySuccess(res){
      if(res.data){
        updateDept($scope,$http);
        $scope.deptMsg = '<span style="color:green">"'+dept+'" deleted</span>';
      } else {
        $scope.deptMsg = '<span style="color:red">error while deleting "'+dept+'"</span>';
      }
    }, function myError(res){
      alert(res.statusText);
    });
  }

  $scope.deactivate = function(uid){
    $http({
      method: "POST",
      url: '/deactivate',
      data: {uid: uid}
    }).then(function mySuccess(res){
      if(res.data){
        angular.element(document.querySelector('#r'+uid)).remove();
      } else {
        alert("Error while deactivating");
      }
    }, function myError(res){
      alert(res.statusText);
    });
  }

  
  $scope.addUserModal = function(uid) {
    $scope.isVendor = false;
    $scope.isLOA = false;
    $scope.nu = {};
    $scope.nu.vendor = {};
    $scope.nu.vendor.PO = {};
    $scope.nu.LOA = {};
    $http({
      method: "POST",
      url: '/getInfoByUID',
      data: {uid: uid}
    }).then(function mySuccess(res){
      if(res.data.status){
        var info = res.data.info;
        $scope.nu.name = info.name;
        $scope.nu.firstName = info.firstname;
        $scope.nu.lastName = info.lastname;
        $scope.nu.uid = info.uid;
        $scope.nu.managerName = info.managerName;
        $scope.nu.dept = info.dept;
        $scope.nu.employeeType = info.employeetype;

        if(info.employeetype == "C" || info.employeetype == "V") $scope.isVendor = true;
        if(info.employeetype == "LOA") $scope.isLOA = true;
        if(info.ismanager) $scope.nu.managerFlag = "TRUE";
        else $scope.nu.managerFlag = "FALSE";
        
        $("#add_user_modal").openModal();

      } else {
        alert('status was false');
        alert(res.data.err);
      }
    }, function myError(res){
      alert('Error in response');
      alert(res.statusText);
    });
  }

  $scope.addUser = function(){

    var transferredDate = new Date($scope.data.transferredDate);
    var dateofBirth = new Date($scope.data.DOB);
    var joinDate = new Date($scope.data.joinDate);

    if(transferredDate < DOB)
      $scope.data.transferredDate.$error.DOBError = true;
    if(joinDate < DOB)
      $scope.data.joinDate.$error.DOBError = true;
    if(transferredDate < joinDate)
      $scope.data.transferredDate.$error.joinDateError = true;
    else
    {

      delete $scope.nu.extra;
      var data = $scope.nu;
      var extra = null;
      var extraFields;
      if($scope.isVendor) {
        extraFields = ['name','contact','POnumber','POstartDate','POendDate'];
        extra = data.vendor;
      } else if($scope.isLOA) {
        extraFields = ['startDate','endDate'];
        extra = data.LOA;
      }
      delete data.vendor;
      delete data.LOA;

      var flag = true;
      var fields = ['uid','name','firstName','lastName','reportingManager','dept','band','employeeType','billingType','DOB','state','gender','bloodGroup','joinDate','transferredDate','mobileNumber','emergencyContactNumber','personalEmail','divisionMajor','major','managerFlag','seatNumber','passportNumber','visaDetails'];
      for(var i=0 ; i<fields.length ; i++){
        flag = flag && data[fields[i]] && !(/^\s*$/.test(data[fields[i]]));
      }
      if(extra){
        for(var i=0 ; i<extraFields.length ; i++){
          flag = flag && extra[extraFields[i]] && !(/^\s*$/.test(extra[extraFields[i]]));
        } 
      }

      if(!flag) {
        alert("All fields are mandatory");
      } else {
        data.extra = extra;
        $http({
          method: "POST",
          url: '/addUser',
          data: data
        }).then(function mySuccess(res){
          if(res.data.status){
            alert("User Added");    
            angular.element(document.querySelector('#u'+data.uid)).remove();
            $("#add_user_modal").closeModal();
            updateUsers();
          } else {
            alert(res.data.err);
          }
        }, function myError(res){
          alert(res.statusText);
        });   
      }

    }
  }
});


app.directive('ngDate' , function(){
	return  {
		restrict: 'A',
		require: 'ngModel',
		link : function($scope ,$element, $attrs , ngModel){
			 ngModel.$parsers.unshift(function(value) {
 			     var birthDate = new Date($scope.nu.DOB);
		 	     var joinDate = new Date($scope.nu.joinDate);
			     console.log(birthDate,joinDate);	  	
			     ngModel.$setValidity('DOB', birthDate < joinDate);
			     return value;
			  });
			ngModel.$parsers.unshift(function(value) {
				 var transferredDate = new Date($scope.nu.transferDate);
				 var joinDate = new Date($scope.nu.joinDate);
				 console.log(transferredDate , joinDate);
				 ngModel.$setValidity('transferError', joinDate < transferredDate);	
			 });
		}

	};
});

app.controller('FormCtrl', function($scope, $http) {

    $scope.submitted = false;
    $scope.submit = function() {
      $scope.submitted = true;
    };
    $scope.interacted = function(field) {
      return $scope.submitted || field.$dirty;
    };

})
