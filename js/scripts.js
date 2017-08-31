let app = new Vue({
    el: '#app',
    data: {
        usr: undefined,
        convs: undefined,
    },
    methods: {
        login: () => {
            request('users/register/' + $('#form-nick').val(), (data) => {
                app.usr = data;

                request('users', (data) => {
                    data.forEach(el => {
                        if(el.nick != app.usr.nick) {
                            peopleList.addItem(new User(el));
                        }
                    });
                });
                
                request('channels', (data) => {
                    data.forEach(el => {
                        channelList.addItem(new Channel(el));
                    });
                });
            }, 'POST');
        },

        createChannel: () => {
            let txt = $('<input type="text" placeholder="Channel name"/>');
            let btn = $('<button>Join</button>').on('click', () => {
                request(`user/${app.usr.id}/channels/${txt.val()}/join/`, (data) => {
                    chat.addItem(data);
                } ,'PUT');
            });
            showMessage([txt, btn], true);
        },

        showInformations: () => {
            showMessage(`<span>${app.usr.nick}</span><span id="#id">${app.usr.id}</span>`);
        },
        
        cancelMessage: () => {
            cancelMessage();
        },

        fetchNotices: setInterval(() => {
            if(app.usr)
            {   
                request(`user/${app.usr.id}/notices/`, (data) => {
                    data.forEach(el => {
                        switch(el.type) {
                            case 'channelJoin':
                                
                            break;
                        }
                    });
                });

                request('users', data => {

                });

                request('channels', data => {

                });
            }
        }, 500),
    }
});

let chat = new ConvList($('.convs'));
let peopleList = new ItemList($('.people-list'));
let channelList = new ItemList($('.channel-list'));

function showMessage(message, append) {
    $('.messagebox').empty();
    append ? $('.messagebox').append(message) : $('.messagebox').html(message);
    $('.main').removeClass('nofilter');
    $('.message').removeClass('displaynone');
}

function cancelMessage() {
    $('.main').addClass('nofilter');
    $('.message').addClass('displaynone');
}

function request(url, callback, type = 'GET', baseUrl = 'http://localhost:8081/') {
    $.ajax({
        url: baseUrl + url.split('?')[0],
        type: type,
        data: url.split('?')[1],

        success: (data) => {
            callback(data);
        },
        error: (data) => {
            console.log('Error ' + data);
        }
     });
}