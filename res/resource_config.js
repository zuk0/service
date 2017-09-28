/**
 * Config for redirect app.
 * Created by TVzavr on 11.07.2017.
 */
var redirect_config, redirect_data, __local;
__local = window.location.origin + '/';
redirect_config = {
    paths: [
        __local + 'service/platforms/desktop/empty.html?' + '&ts=' + new Date().getTime(),
        'http://lg-app.megogo.net/#pageMain',
        /*
        'http://192.168.2.49/state/platforms/lg/netcast_memory.html',
        'http://staging3.tvzavr.ru/html/promo/pnk/',
        __local + 'state/platforms/samsung/video.html?',
        __local + 'tvzavr3.12.7/?',
        __local + 'pnk/?',
        __local + 'tvzavr/?',
        'http://192.168.3.192/',
        */
        'http://services.tvzavr.ru/alliance/?',
        'http://services.tvzavr.ru/tvzavr/webos/?',
        'http://services.tvzavr.ru/tvzavr/netcast/?',
        'http://192.168.3.119:8085/?',
        __local + 'state/?'
    ],
    params: [
        { overrideParams: true, platform: 'tzf'},
        { overrideParams: true, platform: 'sce'},
        { overrideParams: true, platform: 'lgn'},
        { overrideParams: true, platform: 'smp'},
        { overrideParams: true, platform: 'smp', tv: 'tizen'},
        { from: 'LGCinema', aID: 28412 },
        { from: 'LGCinema', aID: 28394 },
        { from: 'LGCinema', aID: 29079 },
        { deeplink: true, type:'video', ref:'banner', action_id: 28047 }
    ],
    user: [
        'no user',
        'new user',
        '@anton',
        '@artem',
        'test01',
        'test55'
    ],
    post: [
        'tvz platform *',
        'lgn platform *',
        'smp platform *',
        'sce platform *',
        'pnc platform *',
        'tvz platform '+ __local
    ],
    iso: [
        'RUB',
        'USD',
        'EUR',
        'KZT',
        'BYR'
    ],
    tests: [
        '@ui/button/click/movies',
        '@ui/button/click/serials',
        '@ui/button/click/cartoons'
    ]
};

app_data = {
    user: [
        {user: false, pass: false},
        {user: true, pass: true},
        {user: 'novikov.a@tvzavr.ru', pass: '123456'},
        {user: 'tvzavrtest01@gmail.com', pass: '333333'},
        {user: 'tvzavrtest55@mail.ru', pass: '666666'},
        {user: 'artem@mail.ru', pass: '555555'}
    ],
    post: [
        {data: {platform:'tvz'},origin: '*'},
        {data: {platform:'lgn'},origin:'*'},
        {data: {platform:'smp'},origin:'*'},
        {data: {platform:'sce'},origin:'*'},
        {data: {platform:'pnc'},origin:'*'},
        {data: {platform:'tvz'},origin: __local}
    ],
    iso: [
        {iso: 'RUB', params: 'currency_iso'},
        {iso: 'USD', params: 'currency_iso'},
        {iso: 'EUR', params: 'currency_iso'},
        {iso: 'KZT', params: 'currency_iso'},
        {iso: 'BYR', params: 'currency_iso'},
    ]
};