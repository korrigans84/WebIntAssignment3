(function () {
    window.localStorage.clear()
    //Modal script
    // Get the modal
    var modal = document.getElementById("modal-login")
    var span = document.getElementsByClassName("close")[0]
// When the user clicks on the button, open the modal
    document.getElementById("btn-login").onclick = function() {
        modal.style.display = "block"
    }

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
    /**
     * Rotation of the video, when the button rotate is clicked
     * @type {string}
     */
    var user = window.localStorage.getItem('user')
    var comments = JSON.parse(window.localStorage.getItem('comments'))
    var video = document.getElementsByTagName('video')[0]
    var controls=true;
    var videoContainer = document.getElementById('video')
    if(!user){
        //all actions if a user is not connected
        Array.from(document.getElementsByClassName('comment')).forEach(
            (comment) => {comment.style.display='none'}
        )
        console.log('not connected')
    }
    else {
        //all actions if a user is connected locally
        Array.from(document.getElementsByClassName('comment')).forEach(
            comment => comment.style.display='block'
        )
        console.log('connected')
    }


    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    canvas.onclick = function(){
        window.open(this.toDataURL());
    };


    var rotate = 0
    document.getElementById("btn-rotate").addEventListener('click', function () {
        rotate += 0.5
        document.getElementById('video').style.transform=`rotate(${rotate}turn)`
        document.getElementById('video').style.transition="transform 1s"
    })
    document.getElementById("btn-thumb").addEventListener('click', function (){
        let output = document.getElementById("preview");
        video.pause()
        ctx.drawImage(video, 0, 0, videoContainer.offsetWidth, videoContainer.offsetHeight)
        output.innerHTML = '';
        console.log(canvas)
        output.appendChild(canvas)
    })
    document.getElementById("input-offset-video").addEventListener('keyup', function (e) {
        var number = e.target.value
        video.currentTime = number
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
            document.getElementsByTagName('video')[0].load()
        }
    })

    document.getElementById('checkbox-controls').addEventListener('change', function (e) {
        let checked = e.target.checked
        video.controls = checked

        //change the label
        this.nextElementSibling.innerHTML = checked ? 'Hide controls' : 'Show controls'
    })



})();
