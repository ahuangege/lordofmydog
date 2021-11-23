var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CD = /** @class */ (function () {
    function CD() {
        console.log(111, this.constructor.name);
    }
    return CD;
}());
var Ab = /** @class */ (function (_super) {
    __extends(Ab, _super);
    function Ab() {
        var _this = _super.call(this) || this;
        console.log(222, _this.constructor.name);
        return _this;
    }
    return Ab;
}(CD));
console.log(Ab.name);
var tmp = new Ab();
console.log(333, tmp.constructor.name);
