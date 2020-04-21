/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./cpu-version/entry.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./cpu-version/entry.js":
/*!******************************!*\
  !*** ./cpu-version/entry.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

let canvas, ctx;
let imageData, pixelData;
let current, next;

const Da = .42,
      Db = 0.125,
      f = .055,
      k = 0.0625;

const weights = {
  north: .2,
  south: .2,
  east: .2,
  west: .2,
  northwest: .05,
  northeast: .05,
  southeast: .05,
  southwest: .05,
  center: -1
};

let setup = () => {
  canvas = document.getElementById('sketch');
  ctx = canvas.getContext('2d');

  current = {
    A: [],
    B: []
  };

  next = {
    A: [],
    B: []
  };

  for(let x = 0; x < canvas.width; x++) {
    current.A[x] = [];
    current.B[x] = [];
    next.A[x] = [];
    next.B[x] = [];

    for(let y = 0; y < canvas.height; y++) {
      current.A[x][y] = 1;
      current.B[x][y] = 0;
      next.A[x][y] = 0;
      next.B[x][y] = 0;

      if(
        x >= canvas.width/2 - 10 &&
        x <= canvas.width/2 + 10 &&
        y >= canvas.height/2 - 10 &&
        y <= canvas.height/2 + 10
      ) {
        current.B[x][y] = 1;
      }
    }
  }

  requestAnimationFrame(update);
}

let update = (timestamp) => {
  // Calculate next A and B values
  for(let x = 0; x < canvas.width; x++) {
    for(let y = 0; y < canvas.height; y++) {
      let A = current.A[x][y],
          B = current.B[x][y],
          diffusionA = Da * laplacian('A', x, y),
          diffusionB = Db * laplacian('B', x, y),
          reaction = A * B * B;

      next.A[x][y] = A + diffusionA - reaction + f * (1 - A);
      next.B[x][y] = B + diffusionB + reaction - (k + f) * B;
    }
  }

  // Make the next values the current ones
  current = next;

  draw();
  requestAnimationFrame(update);
}

let draw = () => {
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  pixelData = imageData.data;

  for(let x = 0; x < canvas.width; x++) {
    for(let y = 0; y < canvas.height; y++) {
      let i = (x + y * canvas.width) * 4;
      // let value = Math.floor(255 * 15 * current.B[x][y] * current.B[x][y] * current.B[x][y]);
      let value = Math.floor((current.A[x][y] - current.B[x][y]) * 255);

      pixelData[i] = value;     // red
      pixelData[i+1] = value;   // green
      pixelData[i+2] = value;   // blue
      pixelData[i+3] = 255;     // alpha
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

let laplacian = (chemical, x, y) => {
  let prevCol = x > 0 ? x - 1 : canvas.width - 1,
      prevRow = y > 0 ? y - 1 : canvas.height - 1,
      nextCol = x < canvas.width - 1 ? x + 1 : 0,
      nextRow = y < canvas.height - 1 ? y + 1 : 0;

  let north = current[chemical][x][prevRow],
      south = current[chemical][x][nextRow],
      east = current[chemical][nextCol][y],
      west = current[chemical][prevCol][y];

  let northwest = current[chemical][prevCol][prevRow],
      northeast = current[chemical][nextCol][prevRow],
      southeast = current[chemical][nextCol][nextRow],
      southwest = current[chemical][prevCol][nextRow];

  return north * weights.north +
         south * weights.south +
         east * weights.east +
         west * weights.west +
         northwest * weights.northwest +
         northeast * weights.northeast +
         southeast * weights.southeast +
         southwest * weights.southwest +
         current[chemical][x][y] * weights.center;
}

setup();

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vY3B1LXZlcnNpb24vZW50cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxnQkFBZ0Isa0JBQWtCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQixtQkFBbUI7QUFDckM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0JBQWdCLGtCQUFrQjtBQUNsQyxrQkFBa0IsbUJBQW1CO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGdCQUFnQixrQkFBa0I7QUFDbEMsa0JBQWtCLG1CQUFtQjtBQUNyQztBQUNBO0FBQ0E7O0FBRUEsMkJBQTJCO0FBQzNCLDZCQUE2QjtBQUM3Qiw2QkFBNkI7QUFDN0IsMkJBQTJCO0FBQzNCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFEiLCJmaWxlIjoiY3B1LmJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vY3B1LXZlcnNpb24vZW50cnkuanNcIik7XG4iLCJsZXQgY2FudmFzLCBjdHg7XHJcbmxldCBpbWFnZURhdGEsIHBpeGVsRGF0YTtcclxubGV0IGN1cnJlbnQsIG5leHQ7XHJcblxyXG5jb25zdCBEYSA9IC40MixcclxuICAgICAgRGIgPSAwLjEyNSxcclxuICAgICAgZiA9IC4wNTUsXHJcbiAgICAgIGsgPSAwLjA2MjU7XHJcblxyXG5jb25zdCB3ZWlnaHRzID0ge1xyXG4gIG5vcnRoOiAuMixcclxuICBzb3V0aDogLjIsXHJcbiAgZWFzdDogLjIsXHJcbiAgd2VzdDogLjIsXHJcbiAgbm9ydGh3ZXN0OiAuMDUsXHJcbiAgbm9ydGhlYXN0OiAuMDUsXHJcbiAgc291dGhlYXN0OiAuMDUsXHJcbiAgc291dGh3ZXN0OiAuMDUsXHJcbiAgY2VudGVyOiAtMVxyXG59O1xyXG5cclxubGV0IHNldHVwID0gKCkgPT4ge1xyXG4gIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdza2V0Y2gnKTtcclxuICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuXHJcbiAgY3VycmVudCA9IHtcclxuICAgIEE6IFtdLFxyXG4gICAgQjogW11cclxuICB9O1xyXG5cclxuICBuZXh0ID0ge1xyXG4gICAgQTogW10sXHJcbiAgICBCOiBbXVxyXG4gIH07XHJcblxyXG4gIGZvcihsZXQgeCA9IDA7IHggPCBjYW52YXMud2lkdGg7IHgrKykge1xyXG4gICAgY3VycmVudC5BW3hdID0gW107XHJcbiAgICBjdXJyZW50LkJbeF0gPSBbXTtcclxuICAgIG5leHQuQVt4XSA9IFtdO1xyXG4gICAgbmV4dC5CW3hdID0gW107XHJcblxyXG4gICAgZm9yKGxldCB5ID0gMDsgeSA8IGNhbnZhcy5oZWlnaHQ7IHkrKykge1xyXG4gICAgICBjdXJyZW50LkFbeF1beV0gPSAxO1xyXG4gICAgICBjdXJyZW50LkJbeF1beV0gPSAwO1xyXG4gICAgICBuZXh0LkFbeF1beV0gPSAwO1xyXG4gICAgICBuZXh0LkJbeF1beV0gPSAwO1xyXG5cclxuICAgICAgaWYoXHJcbiAgICAgICAgeCA+PSBjYW52YXMud2lkdGgvMiAtIDEwICYmXHJcbiAgICAgICAgeCA8PSBjYW52YXMud2lkdGgvMiArIDEwICYmXHJcbiAgICAgICAgeSA+PSBjYW52YXMuaGVpZ2h0LzIgLSAxMCAmJlxyXG4gICAgICAgIHkgPD0gY2FudmFzLmhlaWdodC8yICsgMTBcclxuICAgICAgKSB7XHJcbiAgICAgICAgY3VycmVudC5CW3hdW3ldID0gMTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZSk7XHJcbn1cclxuXHJcbmxldCB1cGRhdGUgPSAodGltZXN0YW1wKSA9PiB7XHJcbiAgLy8gQ2FsY3VsYXRlIG5leHQgQSBhbmQgQiB2YWx1ZXNcclxuICBmb3IobGV0IHggPSAwOyB4IDwgY2FudmFzLndpZHRoOyB4KyspIHtcclxuICAgIGZvcihsZXQgeSA9IDA7IHkgPCBjYW52YXMuaGVpZ2h0OyB5KyspIHtcclxuICAgICAgbGV0IEEgPSBjdXJyZW50LkFbeF1beV0sXHJcbiAgICAgICAgICBCID0gY3VycmVudC5CW3hdW3ldLFxyXG4gICAgICAgICAgZGlmZnVzaW9uQSA9IERhICogbGFwbGFjaWFuKCdBJywgeCwgeSksXHJcbiAgICAgICAgICBkaWZmdXNpb25CID0gRGIgKiBsYXBsYWNpYW4oJ0InLCB4LCB5KSxcclxuICAgICAgICAgIHJlYWN0aW9uID0gQSAqIEIgKiBCO1xyXG5cclxuICAgICAgbmV4dC5BW3hdW3ldID0gQSArIGRpZmZ1c2lvbkEgLSByZWFjdGlvbiArIGYgKiAoMSAtIEEpO1xyXG4gICAgICBuZXh0LkJbeF1beV0gPSBCICsgZGlmZnVzaW9uQiArIHJlYWN0aW9uIC0gKGsgKyBmKSAqIEI7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBNYWtlIHRoZSBuZXh0IHZhbHVlcyB0aGUgY3VycmVudCBvbmVzXHJcbiAgY3VycmVudCA9IG5leHQ7XHJcblxyXG4gIGRyYXcoKTtcclxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcclxufVxyXG5cclxubGV0IGRyYXcgPSAoKSA9PiB7XHJcbiAgaW1hZ2VEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gIHBpeGVsRGF0YSA9IGltYWdlRGF0YS5kYXRhO1xyXG5cclxuICBmb3IobGV0IHggPSAwOyB4IDwgY2FudmFzLndpZHRoOyB4KyspIHtcclxuICAgIGZvcihsZXQgeSA9IDA7IHkgPCBjYW52YXMuaGVpZ2h0OyB5KyspIHtcclxuICAgICAgbGV0IGkgPSAoeCArIHkgKiBjYW52YXMud2lkdGgpICogNDtcclxuICAgICAgLy8gbGV0IHZhbHVlID0gTWF0aC5mbG9vcigyNTUgKiAxNSAqIGN1cnJlbnQuQlt4XVt5XSAqIGN1cnJlbnQuQlt4XVt5XSAqIGN1cnJlbnQuQlt4XVt5XSk7XHJcbiAgICAgIGxldCB2YWx1ZSA9IE1hdGguZmxvb3IoKGN1cnJlbnQuQVt4XVt5XSAtIGN1cnJlbnQuQlt4XVt5XSkgKiAyNTUpO1xyXG5cclxuICAgICAgcGl4ZWxEYXRhW2ldID0gdmFsdWU7ICAgICAvLyByZWRcclxuICAgICAgcGl4ZWxEYXRhW2krMV0gPSB2YWx1ZTsgICAvLyBncmVlblxyXG4gICAgICBwaXhlbERhdGFbaSsyXSA9IHZhbHVlOyAgIC8vIGJsdWVcclxuICAgICAgcGl4ZWxEYXRhW2krM10gPSAyNTU7ICAgICAvLyBhbHBoYVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY3R4LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xyXG59XHJcblxyXG5sZXQgbGFwbGFjaWFuID0gKGNoZW1pY2FsLCB4LCB5KSA9PiB7XHJcbiAgbGV0IHByZXZDb2wgPSB4ID4gMCA/IHggLSAxIDogY2FudmFzLndpZHRoIC0gMSxcclxuICAgICAgcHJldlJvdyA9IHkgPiAwID8geSAtIDEgOiBjYW52YXMuaGVpZ2h0IC0gMSxcclxuICAgICAgbmV4dENvbCA9IHggPCBjYW52YXMud2lkdGggLSAxID8geCArIDEgOiAwLFxyXG4gICAgICBuZXh0Um93ID0geSA8IGNhbnZhcy5oZWlnaHQgLSAxID8geSArIDEgOiAwO1xyXG5cclxuICBsZXQgbm9ydGggPSBjdXJyZW50W2NoZW1pY2FsXVt4XVtwcmV2Um93XSxcclxuICAgICAgc291dGggPSBjdXJyZW50W2NoZW1pY2FsXVt4XVtuZXh0Um93XSxcclxuICAgICAgZWFzdCA9IGN1cnJlbnRbY2hlbWljYWxdW25leHRDb2xdW3ldLFxyXG4gICAgICB3ZXN0ID0gY3VycmVudFtjaGVtaWNhbF1bcHJldkNvbF1beV07XHJcblxyXG4gIGxldCBub3J0aHdlc3QgPSBjdXJyZW50W2NoZW1pY2FsXVtwcmV2Q29sXVtwcmV2Um93XSxcclxuICAgICAgbm9ydGhlYXN0ID0gY3VycmVudFtjaGVtaWNhbF1bbmV4dENvbF1bcHJldlJvd10sXHJcbiAgICAgIHNvdXRoZWFzdCA9IGN1cnJlbnRbY2hlbWljYWxdW25leHRDb2xdW25leHRSb3ddLFxyXG4gICAgICBzb3V0aHdlc3QgPSBjdXJyZW50W2NoZW1pY2FsXVtwcmV2Q29sXVtuZXh0Um93XTtcclxuXHJcbiAgcmV0dXJuIG5vcnRoICogd2VpZ2h0cy5ub3J0aCArXHJcbiAgICAgICAgIHNvdXRoICogd2VpZ2h0cy5zb3V0aCArXHJcbiAgICAgICAgIGVhc3QgKiB3ZWlnaHRzLmVhc3QgK1xyXG4gICAgICAgICB3ZXN0ICogd2VpZ2h0cy53ZXN0ICtcclxuICAgICAgICAgbm9ydGh3ZXN0ICogd2VpZ2h0cy5ub3J0aHdlc3QgK1xyXG4gICAgICAgICBub3J0aGVhc3QgKiB3ZWlnaHRzLm5vcnRoZWFzdCArXHJcbiAgICAgICAgIHNvdXRoZWFzdCAqIHdlaWdodHMuc291dGhlYXN0ICtcclxuICAgICAgICAgc291dGh3ZXN0ICogd2VpZ2h0cy5zb3V0aHdlc3QgK1xyXG4gICAgICAgICBjdXJyZW50W2NoZW1pY2FsXVt4XVt5XSAqIHdlaWdodHMuY2VudGVyO1xyXG59XHJcblxyXG5zZXR1cCgpOyJdLCJzb3VyY2VSb290IjoiIn0=