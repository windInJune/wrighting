<template>
	<div class="water-mark">您处于紧急恢复模式, 重新登录后将恢复到正常登录模式</div>	
</template>

<script>

export default {
	name: 'waterMark',
	// data () {
	// 	return {

	// 	}
	// }
}

</script>

<style>
.water-mark {
	position: fixed;
	bottom: 30px;
	width: 100%;
	height: 50px;
	left: 30px;
	font-size: 30px;
	color: rgba(255, 0, 0, .7);
}
</style>