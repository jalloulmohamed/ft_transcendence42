import { Howl } from "howler";
import {
	Bodies,
	Body,
	Composite,
	Engine,
	Events,
	Render,
	Runner,
	World,
} from "matter-js";

const engine: Engine = Engine.create({
	gravity: {
		x: 0,
		y: 0,
	},
});

const runner: Runner = Runner.create();

class PongGame {
	private ball: Body | undefined;
	private topPaddle: Body | undefined;
	private bottomPaddle: Body | undefined;
	private rightRect: Body | undefined;
	private leftRect: Body | undefined;
	private centerCirle: Body | undefined;
	private separator: Body | undefined;
	private topLeftObstacle: Body | undefined;
	private topRightObstacle: Body | undefined;
	private bottomLeftObstacle: Body | undefined;
	private bottomRightObstacle: Body | undefined;
	private verticalObstacle1: Body | undefined;
	private verticalObstacle2: Body | undefined;
	private verticalObstacle3: Body | undefined;
	private verticalObstacle4: Body | undefined;
	private divWidth: number;
	private divHeight: number;
	private currentBallVelocity: {
		x: number;
		y: number;
	} = {
		x: 0,
		y: 0,
	};
	private lastDirection: string = "top";
	private moveInterval: NodeJS.Timer | undefined;
	// private lunchGameInterval: any;
	private updatePositionInterval: NodeJS.Timer | undefined;
	private handleKeyDown = (e: KeyboardEvent): void => {};
	private handleKeyUp = (e: KeyboardEvent): void => {};
	private handleCollisionStart = (e: any): void => {};
	private handleBeforeUpdate = (): void => {};
	private handleSetVelocity = (data: any) => {};
	private handleSetPosition = (data: any) => {};
	private defaultCanvasSizes: {
		width: number;
		height: number;
	} = {
		width: 560,
		height: 836,
	};
	private paddleSizes: {
		width: number;
		height: number;
	} = {
		width: 170,
		height: 15,
	};
	private map = (
		inputSize: number,
		defaultCanvasSize: number,
		currentCanvasSize: number,
	): number => {
		return (inputSize * currentCanvasSize) / defaultCanvasSize;
	};
	private render: Render;
	playerScore: number = 0;
	botScore: number = 0;
	private sound: {
		topPaddleSound: Howl;
		bottomPaddleSound: Howl;
		goal: Howl;
	} = {
		topPaddleSound: new Howl({
			src: ["/assets/sounds/leftPaddle.mp3"],
		}),
		bottomPaddleSound: new Howl({
			src: ["/assets/sounds/rightPaddle.mp3"],
		}),
		goal: new Howl({
			src: ["/assets/sounds/winSound.mp3"],
		}),
	};

	constructor(
		private parentDiv: HTMLDivElement,
		private chosenMapIndex: number,
		private display_name?: string,
		private socket?: any,
	) {
		this.divWidth = this.parentDiv.getBoundingClientRect().width;
		this.divHeight = this.parentDiv.getBoundingClientRect().height;

		// Update Paddles && ball Size With New Mapped Values:
		this.paddleSizes = {
			width: this.map(
				this.paddleSizes.width,
				this.defaultCanvasSizes.width,
				this.divWidth,
			),
			height: this.map(
				this.paddleSizes.height,
				this.defaultCanvasSizes.height,
				this.divHeight,
			),
		};

		// This Function Will Run In All Maps:
		this.defaultGameMap();

		switch (this.chosenMapIndex) {
			case 1:
				this.gameCircleObstacles();
				break;

			case 2:
				this.gameVerticalObstacles();
				break;
		}

		this.render = Render.create({
			element: this.parentDiv,
			engine: engine,
			options: {
				background: "#3A3561",
				width: this.divWidth,
				height: this.divHeight,
				wireframes: false,
			},
		});

		Render.run(this.render);

		if (this.socket) this.moveOnlineModeBall();
		else {
			this.setBotModeBall();
			this.moveBotPaddle();
		}
		this.movePaddle();

		//Run Game
		this.startGame();
	}

	defaultGameMap = (): void => {
		// Create Ball:
		this.ball = Bodies.circle(
			this.divWidth / 2,
			this.divHeight / 2,
			this.map(15, this.defaultCanvasSizes.width, this.divWidth),
			{
				label: "ball",
				render: {
					fillStyle: "#FFF",
				},
				frictionAir: 0,
				friction: 0,
				inertia: Infinity,
				restitution: 1,
			},
		);

		// const topRect = Bodies.rectangle(this.divWidth / 2, 0, this.divWidth, 20, {
		// 	render: {
		// 		fillStyle: "red",
		// 	},
		// 	isStatic: true,
		// });
		// const bottomRect = Bodies.rectangle(
		// 	this.divWidth / 2,
		// 	this.divHeight,
		// 	this.divWidth,
		// 	20,
		// 	{
		// 		render: {
		// 			fillStyle: "yellow",
		// 		},
		// 		isStatic: true,
		// 	},
		// );

		// Create Two Paddles:
		this.topPaddle = Bodies.rectangle(
			this.divWidth / 2,
			this.map(30, this.defaultCanvasSizes.height, this.divHeight),
			this.paddleSizes.width,
			this.paddleSizes.height,
			{
				label: "topPaddle",
				render: {
					fillStyle: "#4FD6FF",
				},
				isStatic: true,
				// chamfer: { radius: 10 },
			},
		);

		this.bottomPaddle = Bodies.rectangle(
			this.divWidth / 2,
			this.divHeight -
				this.map(30, this.defaultCanvasSizes.height, this.divHeight),
			this.paddleSizes.width,
			this.paddleSizes.height,
			{
				label: "bottomPaddle",
				render: {
					fillStyle: "#FF5269",
				},
				isStatic: true,
				// chamfer: { radius: 10 },
			},
		);

		// Create Two Boundies:
		this.rightRect = Bodies.rectangle(
			this.divWidth,
			this.divHeight / 2,
			this.map(20, this.defaultCanvasSizes.width, this.divWidth),
			this.divHeight,
			{
				label: "rightRect",
				render: {
					fillStyle: "#CFF4FF",
				},
				isStatic: true,
			},
		);

		this.leftRect = Bodies.rectangle(
			0,
			this.divHeight / 2,
			this.map(20, this.defaultCanvasSizes.width, this.divWidth),
			this.divHeight,
			{
				label: "leftRect",
				render: {
					fillStyle: "#CFF4FF",
				},
				isStatic: true,
			},
		);

		this.separator = Bodies.rectangle(
			this.divWidth / 2,
			this.divHeight / 2,
			this.divWidth,
			this.map(8, this.defaultCanvasSizes.height, this.divHeight),
			{
				isSensor: true,
				render: {
					fillStyle: "#CFF4FF",
				},
			},
		);

		this.centerCirle = Bodies.circle(
			this.divWidth / 2,
			this.divHeight / 2,
			this.map(8, this.defaultCanvasSizes.width, this.divWidth),
			{
				isSensor: true,
				render: {
					fillStyle: "#CFF4FF",
				},
			},
		);

		Composite.add(engine.world, [
			this.topPaddle,
			this.bottomPaddle,
			this.separator,
			this.centerCirle,
			this.ball,
			this.rightRect,
			this.leftRect,
			// bottomRect,
			// topRect,
		]);
	};

	gameCircleObstacles = (): void => {
		this.topLeftObstacle = Bodies.circle(
			this.divWidth / 4,
			this.divHeight / 4,
			this.map(50, this.defaultCanvasSizes.width, this.divWidth),
			{
				isStatic: true,
				render: {
					fillStyle: "white",
				},
			},
		);

		this.topRightObstacle = Bodies.circle(
			(3 * this.divWidth) / 4,
			this.divHeight / 4,
			this.map(40, this.defaultCanvasSizes.width, this.divWidth),
			{
				isStatic: true,
				render: {
					fillStyle: "white",
				},
			},
		);

		this.bottomRightObstacle = Bodies.circle(
			(3 * this.divWidth) / 4,
			(3 * this.divHeight) / 4,
			this.map(50, this.defaultCanvasSizes.width, this.divWidth),
			{
				isStatic: true,
				render: {
					fillStyle: "white",
				},
			},
		);

		this.bottomLeftObstacle = Bodies.circle(
			this.divWidth / 4,
			(3 * this.divHeight) / 4,
			this.map(40, this.defaultCanvasSizes.width, this.divWidth),
			{
				isStatic: true,
				render: {
					fillStyle: "white",
				},
			},
		);

		Composite.add(engine.world, [
			this.topLeftObstacle,
			this.topRightObstacle,
			this.bottomLeftObstacle,
			this.bottomRightObstacle,
		]);
	};

	gameVerticalObstacles = (): void => {
		this.verticalObstacle1 = Bodies.rectangle(
			this.divWidth -
				this.map(65, this.defaultCanvasSizes.width, this.divWidth),
			this.divHeight / 5,
			this.map(15, this.defaultCanvasSizes.width, this.divWidth),
			this.map(170, this.defaultCanvasSizes.height, this.divHeight),
			{
				render: {
					fillStyle: "white",
				},
				isStatic: true,
			},
		);

		this.verticalObstacle2 = Bodies.rectangle(
			this.divWidth / 2,
			this.divHeight / 3,
			this.map(15, this.defaultCanvasSizes.width, this.divWidth),
			this.map(100, this.defaultCanvasSizes.height, this.divHeight),
			{
				render: {
					fillStyle: "white",
				},
				isStatic: true,
			},
		);

		this.verticalObstacle3 = Bodies.rectangle(
			this.map(65, this.defaultCanvasSizes.width, this.divWidth),
			(2 * this.divHeight) / 3,
			this.map(15, this.defaultCanvasSizes.width, this.divWidth),
			this.map(170, this.defaultCanvasSizes.height, this.divHeight),
			{
				render: {
					fillStyle: "white",
				},
				isStatic: true,
			},
		);

		this.verticalObstacle4 = Bodies.rectangle(
			this.divWidth -
				this.map(65, this.defaultCanvasSizes.width, this.divWidth),
			(4 * this.divHeight) / 5,
			this.map(15, this.defaultCanvasSizes.width, this.divWidth),
			this.map(170, this.defaultCanvasSizes.height, this.divHeight),
			{
				render: {
					fillStyle: "white",
				},
				isStatic: true,
			},
		);

		Composite.add(engine.world, [
			this.verticalObstacle1,
			this.verticalObstacle2,
			this.verticalObstacle3,
			this.verticalObstacle4,
		]);
	};

	startGame = (): void => {
		// this.lunchGameInterval = setTimeout((): void => {
		// run the engine
		Runner.run(runner, engine);
		// }, 1000);
	};

	moveOnlineModeBall = (): void => {
		this.handleSetVelocity = (data: any) => {
			Body.setVelocity(this.ball!, {
				x: this.map(data.x, this.defaultCanvasSizes.width, this.divWidth),
				y: this.map(data.y, this.defaultCanvasSizes.height, this.divHeight),
			});
		};
		this.handleSetPosition = (data: any) => {
			Body.setPosition(this.ball!, {
				x: this.map(data.x, this.defaultCanvasSizes.width, this.divWidth),
				y: this.map(data.y, this.defaultCanvasSizes.height, this.divHeight),
			});
		};

		this.socket.on("setBallVelocity", this.handleSetVelocity);
		this.socket.on("updateBallPosition", this.handleSetPosition);
	};

	setBotModeBall = (): void => {
		if (this.lastDirection === "top") {
			this.currentBallVelocity = {
				x: this.map(-4, this.defaultCanvasSizes.width, this.divWidth),
				y: this.map(-4, this.defaultCanvasSizes.height, this.divHeight),
			};
		} else {
			this.currentBallVelocity = {
				x: this.map(4, this.defaultCanvasSizes.width, this.divWidth),
				y: this.map(4, this.defaultCanvasSizes.height, this.divHeight),
			};
		}

		Body.setVelocity(this.ball!, {
			x: this.currentBallVelocity.x,
			y: this.currentBallVelocity.y,
		});
	};

	movePaddle = (): void => {
		if (this.socket) {
			document.addEventListener("keydown", (e) => {
				if (e.key === "d" || e.key === "ArrowRight")
					this.socket.emit("keyevent", {
						display_name: this.display_name,
						key: e.key,
						state: "keydown",
					});
				else if (e.key === "a" || e.key === "ArrowLeft")
					this.socket.emit("keyevent", {
						display_name: this.display_name,
						key: e.key,
						state: "keydown",
					});
			});

			document.addEventListener("keyup", (e) => {
				if (e.key === "d" || e.key === "ArrowRight")
					this.socket.emit("keyevent", {
						display_name: this.display_name,
						key: e.key,
						state: "keyup",
					});
				else if (e.key === "a" || e.key === "ArrowLeft")
					this.socket.emit("keyevent", {
						display_name: this.display_name,
						key: e.key,
						state: "keyup",
					});
			});
			this.socket.on("updatePaddlePosition", (data: any) => {
				Body.setPosition(this.bottomPaddle!, {
					x: this.map(
						data.xPosition1,
						this.defaultCanvasSizes.width,
						this.divWidth,
					),
					y: this.bottomPaddle!.position.y,
				});
				Body.setPosition(this.topPaddle!, {
					x: this.map(
						data.xPosition2,
						this.defaultCanvasSizes.width,
						this.divWidth,
					),
					y: this.topPaddle!.position.y,
				});
			});
		} else {
			let movingRight = false;
			let movingLeft = false;

			this.handleKeyDown = (e: KeyboardEvent): void => {
				if (e.key === "d" || e.key === "ArrowRight") movingRight = true;
				else if (e.key === "a" || e.key === "ArrowLeft") movingLeft = true;
			};

			this.handleKeyUp = (e: KeyboardEvent): void => {
				if (e.key === "d" || e.key === "ArrowRight") movingRight = false;
				else if (e.key === "a" || e.key === "ArrowLeft") movingLeft = false;
			};

			document.addEventListener("keydown", this.handleKeyDown);

			document.addEventListener("keyup", this.handleKeyUp);

			this.moveInterval = setInterval(() => {
				let stepX;

				if (movingLeft) {
					stepX =
						this.bottomPaddle!.position.x -
						this.map(11, this.defaultCanvasSizes.width, this.divWidth);
					if (stepX <= this.paddleSizes.width / 2) {
						stepX = this.paddleSizes.width / 2;
					}
					Body.setPosition(this.bottomPaddle!, {
						x: stepX,
						y: this.bottomPaddle!.position.y,
					});
				} else if (movingRight) {
					stepX =
						this.bottomPaddle!.position.x +
						this.map(11, this.defaultCanvasSizes.width, this.divWidth);
					if (stepX >= this.divWidth - this.paddleSizes.width / 2) {
						stepX = this.divWidth - this.paddleSizes.width / 2;
					}
					Body.setPosition(this.bottomPaddle!, {
						x: stepX,
						y: this.bottomPaddle!.position.y,
					});
				}
			}, 10);
		}
	};

	resetToDefaultPosition() {
		// Reset Ball Position
		Body.setPosition(this.ball!, {
			x: this.divWidth / 2,
			y: this.divHeight / 2,
		});

		// Reset Ball Speed
		this.setBotModeBall();

		// Reset Paddles Position
		Body.setPosition(this.bottomPaddle!, {
			x: this.divWidth / 2,
			y:
				this.divHeight -
				this.map(30, this.defaultCanvasSizes.height, this.divHeight),
		});
	}

	setBallVelocity = (): void => {
		// Limit Velocity Value

		// console.log("update ball velocity:", this.ball?.velocity)
		if (this.currentBallVelocity.y === 10 || this.currentBallVelocity.y === -10)
			return;
		else if (this.lastDirection === "top") {
			this.currentBallVelocity.y -= this.map(
				1,
				this.defaultCanvasSizes.height,
				this.divHeight,
			);
		} else {
			this.currentBallVelocity.y += this.map(
				1,
				this.defaultCanvasSizes.height,
				this.divHeight,
			);
		}

		Body.setVelocity(this.ball!, {
			x: this.ball!.velocity.x,
			y: this.currentBallVelocity.y,
		});
	};

	moveBotPaddle = (): void => {
		// Update random position after 3 seconds

		this.updatePositionInterval = setInterval(() => {
			let currentPositionX =
				Math.floor(
					Math.random() * (this.divWidth - this.paddleSizes.width) +
						this.paddleSizes.width / 2,
				) + this.currentBallVelocity.x;

			if (currentPositionX > this.divWidth - this.paddleSizes.width / 2)
				currentPositionX = this.divWidth - this.paddleSizes.width / 2;
			else if (currentPositionX < this.paddleSizes.width / 2)
				currentPositionX = this.paddleSizes.width / 2;

			Body.setPosition(this.topPaddle!, {
				x: currentPositionX,
				y: this.topPaddle!.position.y,
			});
		}, 100);

		this.handleCollisionStart = (e: any): void => {
			const pairs = e.pairs[0];

			if (pairs.bodyA === this.topPaddle || pairs.bodyB === this.topPaddle) {
				this.sound.topPaddleSound.play();
				this.setBallVelocity();
			} else if (
				pairs.bodyA === this.bottomPaddle ||
				pairs.bodyB === this.bottomPaddle
			) {
				this.sound.bottomPaddleSound.play();
				this.setBallVelocity();
			}
		};

		Events.on(engine, "collisionStart", this.handleCollisionStart);
		this.calcScore();

		// Matter.Events.on(engine, "collisionStart", (e) => {
		// 	this.ball.body.velocity.x = -this.ball.body.velocity.x;
		// 	this.ball.body.velocity.y = -this.ball.body.velocity.y;

		// 	if (Math.random() < 0.5) this.ball.body.velocity.x *= -1;
		// 	if (Math.random() < 0.5) this.ball.body.velocity.y *= -1;
		// });
	};

	calcScore = (): void => {
		this.handleBeforeUpdate = () => {
			if (
				this.ball!.position.y > this.bottomPaddle!.position.y ||
				this.ball!.position.y < this.topPaddle!.position.y
			) {
				if (this.ball!.position.y > this.bottomPaddle!.position.y) {
					this.botScore++;
					this.lastDirection = "bottom";
				} else {
					this.playerScore++;
					this.lastDirection = "top";
				}
				this.sound.goal.play();
				this.resetToDefaultPosition();
			}
		};

		Events.on(engine, "beforeUpdate", this.handleBeforeUpdate);
	};

	clear = (): void => {
		const displayBodies = (str: string) => {
			console.log(str);
			for (let body of engine.world.bodies) console.log(body);
		};

		displayBodies("before");

		// Remove Basic Bodies In Default Map
		Composite.remove(engine.world, this.topPaddle!);
		Composite.remove(engine.world, this.bottomPaddle!);
		Composite.remove(engine.world, this.rightRect!);
		Composite.remove(engine.world, this.leftRect!);
		Composite.remove(engine.world, this.ball!);
		Composite.remove(engine.world, this.centerCirle!);
		Composite.remove(engine.world, this.separator!);

		// Remove Obstacles For Map 2
		if (this.chosenMapIndex === 1) {
			console.log("index 1 chosen");
			Composite.remove(engine.world, this.topLeftObstacle!);
			Composite.remove(engine.world, this.topRightObstacle!);
			Composite.remove(engine.world, this.bottomLeftObstacle!);
			Composite.remove(engine.world, this.bottomRightObstacle!);
		} else if (this.chosenMapIndex === 2) {
			console.log("index 1 chosen");
			Composite.remove(engine.world, this.verticalObstacle1!);
			Composite.remove(engine.world, this.verticalObstacle2!);
			Composite.remove(engine.world, this.verticalObstacle3!);
			Composite.remove(engine.world, this.verticalObstacle4!);
		}

		displayBodies("after");

		// Remove Events:
		Events.off(engine, "collisionStart", this.handleCollisionStart);
		Events.off(engine, "beforeUpdate", this.handleBeforeUpdate);

		// clearTimeout Of Paddle Game Runner:
		// clearTimeout(this.lunchGameInterval);
		clearInterval(this.updatePositionInterval);

		// Stop The Runner:
		Runner.stop(runner);

		this.render.canvas?.remove();
		this.render.canvas = null!;
		this.render.context = null!;
		this.render.textures = {};

		// Stop The Render:
		Render.stop(this.render);

		// Clear Engine:
		Engine.clear(engine);
		World.clear(engine.world, false);

		// Remove Listeners:
		document.removeEventListener("keydown", this.handleKeyDown);
		document.removeEventListener("keyup", this.handleKeyUp);

		// Close Socket!
		if (this.socket) {
			this.socket.off("setBallVelocity", this.handleSetVelocity);
			this.socket.off("updateBallPosition", this.handleSetPosition);
			clearInterval(this.moveInterval);
			this.socket.disconnect();
		}
	};
}

export default PongGame;
