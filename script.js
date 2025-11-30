// TODO
/*
Node types to implement:
- Sprites: show sprite, hide sprite (with emotions)
- Change Background
- Tweens
- define user variables
- IF routes
*/

let metadataString = `
{
    "width": 800,
    "height": 600,
	"fullscreen": false
}
`

let metadata = JSON.parse(metadataString)

let thingsToLoad = [
	"scenes/main.json",
	"assets/test.png",
	"assets/cowboy blue.png",
	"assets/cowboy.png",
	"assets/cowboy red.png",
	"assets/bg.png"
];


let scriptData = undefined

let messageBox = undefined,
bgSprite = undefined,
choices = undefined,
sprites = undefined,
message

let activeSprites = new Object()
let spriteProperties = new Object()

let isMessageBoxInteractive = true

let scene
let currentNode
let currentDialogueLine = 0
let tapCountDown = 0

let windowWidth = metadata.width
let windowHeight = metadata.height

let g = hexi(metadata.width, metadata.height, setup, thingsToLoad, load)
g.start()


function load(){
	g.loadingBar()
}

function setup() {
    g.fps = 30;
	setScene(g.json("scenes/main.json"))
	currentNode = scene[0]
	
    resolveCurrentNode()
    g.border = "1px solid black"

    g.state = play
}

function play(){
	let hit = detectHitRecursive(g.stage.children)
	// hit == true ? console.log("hit") : console.log("no hit")
}

function setScene(newScene) {
	scene = newScene
	g.stage.removeChildren(0, undefined)

	sprites = g.group()
	g.stage.addChild(sprites)

	messageBox = g.rectangle(windowWidth, windowHeight / 5, "#000000")
    messageBox.alpha = 0.4;
	messageBox.interact = true
	// g.makeInteractive(messageBox);
	isMessageBoxInteractive = true
	messageBox.tap = onMesssageBoxTap;
	messageBox.layer = 10
	g.stage.putBottom(messageBox, 0, -windowHeight / 5)

    message = g.text("Message", undefined, "black")
	message.layer = 11
    g.stage.putBottom(message, 0, -windowHeight / 5)

	choices = g.group()

	g.pointer.tap = handleTapGeneral

	console.log(g)
}

function handleTapGeneral() {
	let hit = detectHitRecursive(g.stage.children)
	// hit == true ? console.log("hit") : console.log("no hit")
	if (hit == false && currentNode.type == "dialogue") {
		onMesssageBoxTap()
		return
	}
	if (hit == false && currentNode.type == "wait") {
		tapCountDown += 1
		if (tapCountDown >= 1) setCurrentNode(scene[currentNode.next])
		return
	}
	if (hit == false && currentNode.next) {
		setCurrentNode(scene[currentNode.next])
	}
}

function detectHitRecursive(that) {
	let nextIter = []
	let result = false
	that.forEach(child => {
		if (g.hit(g.pointer, child) == true) {
			// console.log(child)
			result = true
			if (child === bgSprite) result = false;
		}
		if (child.children.length > 0) nextIter.concat(child.children)
	})
	if (result == true) return result
	if (nextIter.length == 0) return false
	
	return detectHitRecursive(nextIter)
}

function setCurrentNode(newNode) {
	if (!newNode) return

	currentNode = newNode
	currentDialogueLine = 0
	tapCountDown = 0
	resolveCurrentNode()
}

function toggleMessageBox(visibility) {
	if (visibility == false) {
		// console.log("box hidden")
		messageBox.interact = false
		messageBox.tap = () => {}
		g.stage.removeChild(messageBox)
		g.stage.removeChild(message)
	}
	else {
		if (g.stage.children.includes(messageBox) == false) g.stage.addChild(messageBox)
		if (g.stage.children.includes(message) == false) g.stage.addChild(message)
	}
}

function resolveCurrentNode() {
	// console.log(currentNode)
	messageBox.interact = false
	switch (currentNode.type) {
		case "dialogue":
			// isMessageBoxInteractive = true
			toggleMessageBox(true)

			messageBox.interact = true
			message.content = currentNode.text[currentDialogueLine];
			g.stage.putBottom(message, 0, -windowHeight / 5)
			break;
		case "choice":
			for (choice in currentNode.choices) {
				let ctext = g.text(choice)
				choices.addChild(ctext)
				ctext.interact = true
				// g.makeInteractive(ctext)
				ctext.tap = onChoiceTap(currentNode.choices[choice])
			}

			// g.stage.putCenter(choices.children[0])
    		// g.flowDown(10, choices.children)
			for (let i = 1; i < choices.children.length; i += 1) {
				choices.children[i].y = choices.children[i - 1].y + choices.children[i - 1].halfHeight * 2 + 10
			}
			g.stage.putCenter(choices, 0, -choices.halfHeight)
			break;
		case "hide messagebox":
			toggleMessageBox(false)
			setCurrentNode(scene[currentNode.next])
			break;
		case "show sprite":
			let spritePath = "assets/"
			if (currentNode.expression) spritePath += currentNode.sprite + " " + currentNode.expression + ".png"
			else spritePath += currentNode.sprite + ".png"

			activeSprites[currentNode.sprite] = g.sprite(spritePath)
			if (!spriteProperties[currentNode.sprite]) spriteProperties[currentNode.sprite] = new Object()

			if (currentNode.hasOwnProperty("properties")) {
				for (let prop in currentNode.properties) {
					spriteProperties[currentNode.sprite][prop] = currentNode.properties[prop]
				}
			}

			let thisSprite = activeSprites[currentNode.sprite]
			thisSprite.pivotX = 0.5
			thisSprite.pivotY = 1

			let thisProperties = spriteProperties[currentNode.sprite]
			// console.log(thisProperties)

			thisProperties.x == null ? {} : thisSprite.x = thisProperties.x * windowWidth
			thisProperties.y == null ? thisSprite.y = windowHeight : thisSprite.y = thisProperties.y * windowHeight
			thisProperties.scaleX == null ? {} : thisSprite.scaleX = thisProperties.scaleX
			thisProperties.scaleY == null ? {} : thisSprite.scaleY = thisProperties.scaleY
			thisProperties.scale == null ? {} : (thisSprite.scaleX = thisProperties.scale,
				thisSprite.scaleY = thisProperties.scale
			)
			
			thisSprite.interact = true
			thisSprite.layer = 1

			setCurrentNode(scene[currentNode.next])
			break
		case "hide sprite":
			g.stage.removeChild(activeSprites[currentNode.sprite])
			break
		case "set background":
			let bgPath = "assets/" + currentNode.sprite + ".png"
			if (bgSprite) g.stage.removeChild(bgSprite)
			bgSprite = g.sprite(bgPath)
			bgSprite.width = windowWidth
			bgSprite.height = windowHeight
			bgSprite.layer = -1
			setCurrentNode(scene[currentNode.next])
			break
		case "wait":
			break
	}
}

function onChoiceTap(choiceID) {
	return function() {
		setCurrentNode(scene[choiceID])
		// choices = g.group()
		choices.children.forEach(child => {
			child.tap = () => {}
			child.interact = false
		})
		choices.removeChildren(0, undefined)
	}
}

function onMesssageBoxTap() {
	// console.log("message box tapped")
	if (isMessageBoxInteractive == false) return;
	
	let length = currentNode.text.length
	if (currentDialogueLine < length - 1) {
		currentDialogueLine += 1
		resolveCurrentNode()
	}
	else {
		if (!currentNode.next) return;
		messageBox.interact = false
		setCurrentNode(scene[currentNode.next])
	}
}