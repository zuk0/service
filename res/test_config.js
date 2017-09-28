/**
 * Created by TVzavr on 22.08.2017.
 */

var tests_config, tests_data;

tests_config = {
    namespace: '@ui/button',
    actor: 'click',
    desc: 'test all buttons on main page are clickable',
    legends: {
        main: ['page','focus'], allowed: ['app','api','resp']
    }
};

tests_data = [
    {
        id: "@ui/button/click/movies",
        desc: "it should open page 'videos' with category 'movies'",
        selector: {name: '.btn-blue', eq: 1},
        page: ['videos','71','Фильмы'],
        focus: '.carousel-lst-itm.nav-itm.first',
        back: {with:'key', key: 'RETURN'}
    },
    {
        id: "@ui/button/click/serials",
        desc: "it should open page 'videos' with category 'serials'",
        selector: {name: '.btn-blue', eq: 2},
        page: ['videos','675','Сериалы'],
        focus: '.carousel-lst-itm.nav-itm.first',
        back: {with:'click', click:{name: '.btn-blue', eq: 0}}
    },
    {
        id: "@ui/button/click/cartoons",
        desc: "it should open page 'videos' with category 'cartoons'",
        selector: {name: '.btn-blue', eq: 3},
        page: ['videos','678','Мультфильмы'],
        focus: '.carousel-lst-itm.nav-itm.first',
        back: {with:"test", test:"@ui/button/click/home"}
    }
];