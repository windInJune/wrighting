<template>
	<div class="music-bubble" v-bind:class="{hoverBubble: bubbleOnHover}" id="bubble" v-drag="{setDragging: setDragging, getDragging: getDragging, getMusicWindow: getMusicWindow}" v-on:mouseenter="bubbleOnHover = true" v-on:mouseleave="bubbleOnHover = false">
		<div class="music-font iconfont icon-music"></div>
	</div>
</template>

<script>

import { ipcRenderer, remote } from "electron";

//width 48 square, rotate 90 degree, get 48X1.414, there is about
//10 px longer on each side
const padding = 2;
const topBarHeight = 32;

const antiShake = 2;

export default{
	name: 'bubble',
	data() {
		return {
			dragging: false,
			bubbleOnHover: false
		}
	},
	computed: {
	},
	methods: {
	    getMusicWindow(){
	    	if(this.dragging) return;
	        console.log("try to get a music window");
			ipcRenderer.send('create-music-window');
		},
	    setDragging(aBool){
            console.log("set dragging to a Bool: " + aBool);
            this.dragging = aBool
        },
        getDragging(){
        	return this.dragging
        }

	},
    directives:{

    	drag(el, binding){
    		el.onmousedown = function(e){
    			//if not a left click, just return
    			//forbid right click drag
    			if(e.button !== 0) return;

			    if(e.stopPropagation) e.stopPropagation();
			    if(e.preventDefault) e.preventDefault();
			    e.cancelBubble=true;
			    e.returnValue=false;


    			console.log("mouse down event: ");
    			console.log(e)
    			let oldPosX = el.offsetLeft;
    			let oldPosY = el.offsetTop;
				console.log("x: " + el.offsetLeft);
    			console.log("y: " + el.offsetTop);
    			// let divx = e.clientX - el.offsetLeft;
    			// let divy = e.clientY - el.offsetHeight;

    			let clickedX = e.clientX;
    			let clickedY = e.clientY;

    			console.log("clicked at x: " + clickedX);
    			console.log("y: " + clickedY);

    			document.onmousemove = function(e){
    				// if(Math.abs(e.clientX - el.offsetLeft) < el.offsetWidth*0.5 ) return;

				    if(e.stopPropagation) e.stopPropagation();
				    if(e.preventDefault) e.preventDefault();
				    e.cancelBubble=true;
				    e.returnValue=false;


	    			let afterMoveX = e.clientX;
	    			let afterMoveY = e.clientY;

					console.log(typeof(clickedX));
					console.log(typeof(oldPosX));

					let movedX = afterMoveX - clickedX;
					let movedY = afterMoveY - clickedY;

					console.log("moved at x: " + movedX);
					console.log("moved at y: " + movedY);


	    			if((Math.abs(movedX)< antiShake) && (Math.abs(movedY) < antiShake)){
	    				console.log("in this case?")
	    				return;
	    			} 

    				console.log("moved moved moved")
    				// setTimeout(() => {
    				binding.value.setDragging(true);
	    			el.style.cursor = "move";

	    			console.log("e's client x is " + e.clientX);
	    			console.log("el's offset left " + el.offsetLeft);
	    			console.log("moved x is: " + movedX);



	    			// let left = e.clientX - divx;
	    			// let top = e.clientY - divy;

	    			// if(left<=0.5*el.offsetWidth) left = 0.5*el.offsetWidth;
	    			// if(top<=0.5*el.offsetHeight) top = 0.5*el.offsetHeight;
	    			// console.log("left: ", oldPosX + el.offsetWidth + padding + movedX);
	    			// console.log("window: inner width: " + window.innerWidth)

	    			let left = (oldPosX + el.offsetWidth + padding + movedX >= window.innerWidth) ? window.innerWidth -el.offsetWidth/2 : oldPosX + movedX;
	    			let top = (oldPosY + el.offsetHeight + padding + movedY >= window.innerHeight) ? window.innerHeight - el.offsetHeight - padding : oldPosY + movedY;
	    			top = (top < topBarHeight ) ? topBarHeight : top;
	    			left = (left < 0) ? 0 : left

	    			console.log("left: " + left);
	    			console.log("top: " + top);


	    			el.style.left = left + "px";
	    			el.style.top = top + "px";
		    		// }, 0)
    			}

    			document.onmouseup = function(e){
                    document.onmousemove = null;
                    document.onmouseup = null;
                    document.onselectstart = null;
    				el.style.cursor = "pointer";
    				if(!binding.value.getDragging()) binding.value.getMusicWindow()
                    binding.value.setDragging(false);

    			}
    			document.onselectstart = function(){
    				console.log("try to clear selection range");
    				window.getSelection().removeAllRanges();
    			}
    		}
    	}
    },

	created(){

	},
	mounted(){

	},
	beforeUpdate(){
	},
	beforeDestroy(){
		console.log("destroy bubble");
	}
}


</script>

<style>
.music-bubble {
	position: absolute;
	right: 30px;
	bottom: 60px;
	background-color: rgba(0, 0, 0, .04);
	width: 48px;
	height: 48px;
	font-size: 24px;
	line-height: 48px;
	color: #FFF;
	border-radius: 24px;
	text-align: center;
	cursor: pointer;
	-webkit-app-region: no-drag;
}

.hoverBubble{
	background: linear-gradient(#FBBD36, #FFA000); 
	box-shadow: 0px 6px 6px rgba(255, 162, 3, .2);
}

.music-bubble .music-font{
	// -webkit-animation: spin linear 2s infinite;
	font-size: 24px;
	line-height: 24px;
	width: 24px;
	height: 24px;
	position: relative;
	top: 12px;
	left: 12px;
	-webkit-app-region: no-drag;
}

@-webkit-keyframes spin{
	0%{transform: rotate(0deg)}
	100%{transform: rotate(-360deg)}
}


</style>