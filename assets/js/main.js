/**
 * Function Time ago, for comments
 * @param date
 * @returns {string}
 */
function timeAgo(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}
(function () {


    var user = window.sessionStorage.getItem('user')? JSON.parse(window.sessionStorage.getItem('user')) : null
    var commentsFromLocalStorage =window.localStorage.getItem('comments')
    var latitude = null
    var longitude = null

    //Getter of DOM elements
    var formComment = document.getElementById("form-comment")
    var btnLogin = document.getElementById("btn-login")
    var comments = commentsFromLocalStorage? JSON.parse(commentsFromLocalStorage): []
    var video = document.getElementsByTagName('video')[0]
    var videoContainer = document.getElementById('video')

    var modal = document.getElementById("modal-login")
    var span = document.getElementsByClassName("close")[0]
    var mirrorCanvas = document.getElementById("canvas-mirror")

    var formLogin = document.getElementById("form-login")
    var userInfo = document.getElementById('profile')

    function getPosition(){
        return navigator.geolocation.getCurrentPosition( function(position) {
            latitude =  position.coords.latitude;
            longitude =  position.coords.longitude;
        }, function () {
            console.error('unable to locate the user')
        });
    }
    getPosition()

    function addCommentToDom(comment) {
        //${comment.user.firstname} ${comment.user.lastname.toUpperCase()}
        var HTMLelement = document.createElement("div")
        HTMLelement.classList.add('comment')
        HTMLelement.style.display='block'// by default
        HTMLelement.innerHTML = `<p>${comment.comment}</p>
            <p class="comment-captions">
            <span>  By ${comment.user.firstname} ${comment.user.lastname}, ${timeAgo(new Date(comment.date))} ago</span>
            </p>`
        if(comment.position){
            HTMLelement.innerHTML+=`
            <details>
            <summary>Show Localisation</summary>
            <iframe width="100%" height="400" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=${comment.position.lat},${comment.position.long}&amp;t=&amp;z=17&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"></iframe>
           
            </details>
`

        }

        if(!user){
            HTMLelement.style.display='none'
        }
        document.getElementById("comments").appendChild(HTMLelement)
    }
    function displayUserInfos(){
        userInfo.innerHTML=`            
            <img src="https://eu.ui-avatars.com/api/?name=${user.firstname}+${user.lastname}">
            <p>
            Welcome ${user.firstname}
            
            </p>

            `
        userInfo.style.display='block'
    }
    function initialize(){
        //comments
        comments.forEach(comment => addCommentToDom(comment))
        //user
        if(!user){
            userInfo.style.display='none'
            //all actions if a user is not connected
            formComment.children.item(0).style.display='none'
            console.log('not connected')
        }
        else {
            displayUserInfos()
            //all actions if a user is connected locally
            Array.from(document.getElementsByClassName('comment')).forEach(
                comment => comment.style.display='block'
            )
            btnLogin.innerHTML='logout'

            console.log('connected')
        }
    }
    initialize()

    /**********************************************************
     *                  Events Listeners
     ********************************************************/
    //Comment form handle submit
   formComment.addEventListener('submit', async function (e){
        e.preventDefault()
       console.log(getPosition())
        var data = new FormData(formComment)
        comment=Object.fromEntries(data)
       comment = {
            key: Date.now(),
            user: user,
           position: {long: longitude, lat: latitude},
           date: new Date(),
           ...comment
       }
        comments.push(comment)
        window.localStorage.setItem('comments', JSON.stringify(comments))
       addCommentToDom(comment)
    })

    // When the user clicks on the login button, open the modal
    btnLogin.addEventListener('click', function() {
        if(!user) {
            modal.style.display = "block"
        }
        else{//logout
            user=null
            window.sessionStorage.removeItem('user')
            btnLogin.innerHTML='Login'
            userInfo.style.display='none'
        }
    })

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none"
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none"
        }
    }
    //login form
    formLogin.addEventListener('submit', function (e){
        e.preventDefault()
        if(!user) {
            var data = new FormData(formLogin)
            user=Object.fromEntries(data)
            window.sessionStorage.setItem('user', JSON.stringify(user))
            btnLogin.innerHTML="Logout"
            Array.from(document.getElementsByClassName('comment')).forEach(comment => comment.style.display='block')
            formComment.children.item(0).style.display='block'
            displayUserInfos()
        }
        modal.style.display = "none"

    })

    var canvas = document.getElementById('preview')
    var ctx = canvas.getContext('2d')
    canvas.onclick = function(){
        window.open(this.toDataURL());
    };

    var rotate = 0
    document.getElementById("btn-rotate").addEventListener('click', function () {
        rotate += 0.5
        video.style.transform=`rotate(${rotate}turn)`
        video.style.transition="transform 1s"
    })
    document.getElementById("btn-thumb").addEventListener('click', function (){
        video.pause()
        ctx.drawImage(video, 0, 0, videoContainer.offsetWidth, videoContainer.offsetHeight)

    })
    document.getElementById("input-offset-video").addEventListener('keyup', function (e) {
        var number = e.target.value
        video.currentTime = number
    })

    //mirror video
    var mirrorContext = mirrorCanvas.getContext("2d")
    mirrorContext.scale(-1,1)
    mirrorContext.save()
    function mirrorVideo(){
        if(video.paused || video.ended){return}
        mirrorContext.drawImage(video,0,0,-videoContainer.offsetWidth*0.5, videoContainer.offsetHeight*0.5)
        setTimeout(mirrorVideo,0)
    }
    video.addEventListener("play", function (e){
        mirrorVideo()
    })
    document.getElementById("input-url").addEventListener('change', function (e) {
        var data = e.target.value
        var errorContainer = this.nextElementSibling;

        //We verify if the video format of the user is correct (.mp4 or .webm)
        if(!data.match(/([a-zA-Z0-9\s_\\.\-\(\):])+(.mp4|.webm)$/)){
            errorContainer.innerHTML="Bad format video"
            this.style.border="5px solid #e74c3c"
        }else{
            errorContainer.innerHTML=' '
            this.style.border="1px solid #2C3E50"
            document.getElementById("source").src=data
            video.load()
        }
    })

    document.getElementById('checkbox-controls').addEventListener('change', function (e) {
        let checked = e.target.checked
        console.log(checked)
        video.controls = checked

        //change the label
        this.nextElementSibling.innerHTML = checked ? 'Hide controls' : 'Show controls'
    })

    //Duplication of code is bad.. I don't have enouth time to find another solution
    document.getElementById('suggestion1').addEventListener('click', function (e) {
        document.getElementById("source").src=this.getAttribute('data')
        video.load()
    })
    document.getElementById('suggestion2').addEventListener('click', function (e) {
        document.getElementById("source").src=this.getAttribute('data')
        video.load()
    })


})();
