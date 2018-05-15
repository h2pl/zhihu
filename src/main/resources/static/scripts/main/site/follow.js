(function (window, undefined) {
    var Business = Base.getClass('main.util.Business');

    Base.ready({
        initialize: fInitialize
    });

    function fInitialize() {
        Business.followUser();
    }
})();