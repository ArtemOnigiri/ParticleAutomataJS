const cnv = document.getElementById('cnv');
const width = cnv.width = window.innerWidth;
const height = cnv.height = window.innerHeight;
const ctx = cnv.getContext('2d');

const BG_COLOR = '#141e46';
const LINK_COLOR = 'rgba(255, 230, 0, 0.7)';
const COLORS = [
	'#fa1414',
	'#c88c64',
	'#50aa8c',
	'#0096e6',
	'#0a14e6',
	'#8200c8',
	'#fa96d2',
	'#828282'
];

const R = 5;
const NODE_COUNT = 1500;
const MAX_DIST = 100;
const SPEED = 4;
const BORDER = 10;

const maxDist2 = MAX_DIST * MAX_DIST;
const fw = width / MAX_DIST + 1;
const fh = height / MAX_DIST + 1;

let RULE_SIZE = 3;
let MAX_LINKS = [];
let COUPLINGS = [];
let MAX_LINKS_PER_COLOR = [];

let links = [];
let fields = [];

startNew();

// COUPLINGS = [
// 	[1, 1, -1],
// 	[1, 1, 1],
// 	[1, 1, 1]
// ];
// MAX_LINKS = [1, 3, 2];
// MAX_LINKS_PER_COLOR = [
// 	[0, 1, 1],
// 	[1, 2, 1],
// 	[1, 1, 2]
// ];

// COUPLINGS = [
// 	[-1, -1, 1],
// 	[-1, 1, 1],
// 	[-1, 1, -1]
// ];
// MAX_LINKS = [2, 0, 2];
// MAX_LINKS_PER_COLOR = [
// 	[0, 0, 2],
// 	[0, 0, 0],
// 	[2, 1, 1]
// ];

// COUPLINGS = [
// 	[1, 0, 1, 0],
// 	[1, 0, 0, 1],
// 	[0, 0, 0, 0],
// 	[1, 0, 0, 0]
// ];
// MAX_LINKS = [1, 2, 3, 1];
// MAX_LINKS_PER_COLOR = [
// 	[1, 1, 0, 1],
// 	[2, 0, 0, 2],
// 	[2, 1, 0, 3],
// 	[1, 0, 1, 0]
// ];

if(location.hash) {
	let hash = location.hash.substring(1).split('-');
	console.log(...hash);
	let c = 0;
	RULE_SIZE = hash[c];
	generateRules();
	c++;
	for (let i = 0; i < RULE_SIZE; i++) {
		MAX_LINKS[i] = (hash[c] >> (i * 2)) & 3;
	}
	c++;
	for (let i = 0; i < RULE_SIZE; i++) {
		for (let j = 0; j < RULE_SIZE; j++) {
			COUPLINGS[i][j] = ((hash[c] >> (j * 2)) & 3) - 1;
		}
		c++;
	}
	for (let i = 0; i < RULE_SIZE; i++) {
		for (let j = 0; j < RULE_SIZE; j++) {
			MAX_LINKS_PER_COLOR[i][j] = (hash[c] >> (j * 2)) & 3;
		}
		c++;
	}
	history.pushState(null, null, ' ');
}

let frame = 0;

ctx.lineWidth = 1;
ctx.strokeStyle = LINK_COLOR;
window.requestAnimationFrame(update);

function startNew() {
	generateRules();
	generateNodes();
}

function generateNodes() {
	links = [];
	fields = [];
	for (let i = 0; i < fw; i++) {
		fields.push([]);
		for (let j = 0; j < fh; j++) {
			fields[i].push([]);
		}
	}
	for (let i = 0; i < NODE_COUNT; i++) {
		addParticle(Math.random() * width, Math.random() * height, ~~(Math.random() * RULE_SIZE));
	}
}

function generateRules() {
	MAX_LINKS = [];
	COUPLINGS = [];
	MAX_LINKS_PER_COLOR = [];
	for (let i = 0; i < RULE_SIZE; i++) {
		MAX_LINKS.push(~~(Math.random() * 4));
		COUPLINGS.push([]);
		MAX_LINKS_PER_COLOR.push([]);
		for (let j = 0; j < RULE_SIZE; j++) {
			COUPLINGS[i].push(Math.floor(Math.random() * 3 - 1));
			MAX_LINKS_PER_COLOR[i].push(~~(Math.random() * 4));
		}
	}
}

function copyRules() {
	let hash = '';
	hash += RULE_SIZE;
	let links_hash = 0;
	for (let i = 0; i < RULE_SIZE; i++) {
		links_hash |= MAX_LINKS[i] << (i * 2);
	}
	hash += '-' + links_hash;
	for (let i = 0; i < RULE_SIZE; i++) {
		let row = 0;
		for (let j = 0; j < RULE_SIZE; j++) {
			row |= (COUPLINGS[i][j] + 1) << (j * 2);
		}
		hash += '-' + row;
	}
	for (let i = 0; i < RULE_SIZE; i++) {
		let row = 0;
		for (let j = 0; j < RULE_SIZE; j++) {
			row |= (MAX_LINKS_PER_COLOR[i][j]) << (j * 2);
		}
		hash += '-' + row;
	}
	hash = window.location.href + '#' + hash;
	let tempInput = document.createElement("input");
	tempInput.value = hash;
	document.body.appendChild(tempInput);
	tempInput.select();
	document.execCommand("copy");
	document.body.removeChild(tempInput);
}

function removeFromArray(array, item) {
    array.splice(array.indexOf(item), 1);
}

function drawCircle(x, y, type) {
	ctx.fillStyle = COLORS[type];
	ctx.beginPath();
	ctx.arc(x, y, R, 0, 2 * Math.PI);
	ctx.fill();
}

function addParticle(x, y, type) {
	let a = {x, y, type, sx: 0, sy: 0, bonds: []};
	const fx = Math.floor(x / MAX_DIST);
	const fy = Math.floor(y / MAX_DIST);
	fields[fx][fy].push(a);
}

function linkParticles(a, b) {
	a.bonds.push(b);
	b.bonds.push(a);
	links.push({a, b});
}

function applyForce(a, b) {
	const dx = (a.x - b.x);
	const dy = (a.y - b.y);
	let dist2 = dx * dx + dy * dy;
	if(dist2 < maxDist2) {
		let da = COUPLINGS[a.type][b.type] / dist2;
		let db = COUPLINGS[b.type][a.type] / dist2;
		if(a.bonds.length < MAX_LINKS[a.type] && b.bonds.length < MAX_LINKS[b.type]) {
			if(dist2 < maxDist2 / 4) {
				if(a.bonds.indexOf(b) === -1 && b.bonds.indexOf(a) === -1) {
					let typeCountA = 0;
					a.bonds.forEach(bond => {
						if(bond.type === b.type) typeCountA++;
					});
					let typeCountB = 0;
					b.bonds.forEach(bond => {
						if(bond.type === a.type) typeCountB++;
					});
					if(typeCountA < MAX_LINKS_PER_COLOR[a.type][b.type] && typeCountB < MAX_LINKS_PER_COLOR[b.type][a.type]) {
						linkParticles(a, b);
					}
				}
			}
		}
		else {
			if(a.bonds.indexOf(b) === -1 && b.bonds.indexOf(a) === -1) {
				da = 1 / dist2;
				db = 1 / dist2;
			}
		}
		const angle = Math.atan2(a.y - b.y, a.x - b.x);
		if(dist2 < 1) dist2 = 1;
		if(dist2 < R * R * 4) {
			da = 1 / dist2;
			db = 1 / dist2;
		}
		a.sx += Math.cos(angle) * da * SPEED;
		a.sy += Math.sin(angle) * da * SPEED;
		b.sx -= Math.cos(angle) * db * SPEED;
		b.sy -= Math.sin(angle) * db * SPEED;
	}
}

function drawScene() {
	ctx.fillStyle = BG_COLOR;
	ctx.fillRect(0, 0, width, height);
	for (let i = 0; i < links.length; i++) {
		const a = links[i].a;
		const b = links[i].b;
		ctx.beginPath();
		ctx.moveTo(a.x, a.y);
		ctx.lineTo(b.x, b.y);
		ctx.stroke();
	}
	for (let i = 0; i < fw; i++) {
		for (let j = 0; j < fh; j++) {
			const field = fields[i][j];
			for (let k = 0; k < field.length; k++) {
				const a = field[k];
				drawCircle(a.x, a.y, a.type);
			}
		}
	}
}

function logic() {
	for (let i = 0; i < fw; i++) {
		for (let j = 0; j < fh; j++) {
			const field = fields[i][j];
			for (let k = 0; k < field.length; k++) {
				const a = field[k];
				a.x += a.sx;
				a.y += a.sy;
				a.sx *= 0.98;
				a.sy *= 0.98;
				const magnitude = Math.sqrt(a.sx * a.sx + a.sy * a.sy);
				if(magnitude > 1) {
					a.sx /= magnitude;
					a.sy /= magnitude;
				}
				if(a.x < BORDER) {
					a.sx += SPEED * 0.05;
					if(a.x < 0) {
						a.x = -a.x;
						a.sx *= -0.5;
					}
				}
				else if(a.x > width - BORDER) {
					a.sx -= SPEED * 0.05;
					if(a.x > width) {
						a.x = width * 2 - a.x;
						a.sx *= -0.5;
					}
				}
				if(a.y < BORDER) {
					a.sy += SPEED * 0.05;
					if(a.y < 0) {
						a.y = -a.y;
						a.sy *= -0.5;
					}
				}
				else if(a.y > height - BORDER) {
					a.sy -= SPEED * 0.05;
					if(a.y > height) {
						a.y = height * 2 - a.y;
						a.sy *= -0.5;
					}
				}
			}
		}
	}
	for (let i = 0; i < links.length; i++) {
		const link = links[i];
		const a = link.a;
		const b = link.b;
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		let dist2 = dx * dx + dy * dy;
		if(dist2 > maxDist2 / 4) {
			removeFromArray(a.bonds, b);
			removeFromArray(b.bonds, a);
			removeFromArray(links, link);
			i--;
		}
		else {
			if(dist2 > R * R * 4) {
				const angle = Math.atan2(a.y - b.y, a.x - b.x);
				const dA = -0.015;
				a.sx += Math.cos(angle) * dA * SPEED;
				a.sy += Math.sin(angle) * dA * SPEED;
				b.sx -= Math.cos(angle) * dA * SPEED;
				b.sy -= Math.sin(angle) * dA * SPEED;
			}
		}
	}
	for (let i = 0; i < fw; i++) {
		for (let j = 0; j < fh; j++) {
			const field = fields[i][j];
			for (let k = 0; k < field.length; k++) {
				const a = field[k];
				const fx = Math.floor(a.x / MAX_DIST);
				const fy = Math.floor(a.y / MAX_DIST);
				if((fx !== i) || (fy !== j)) {
					removeFromArray(field, a);
					fields[fx][fy].push(a);
				}
			}
		}
	}
	for (let i = 0; i < fw; i++) {
		for (let j = 0; j < fh; j++) {
			const field = fields[i][j];
			for (let i1 = 0; i1 < field.length; i1++) {
				const a = field[i1];
				for (let j1 = i1 + 1; j1 < field.length; j1++) {
					const b = field[j1];
					applyForce(a, b);
				}
				if(i < fw - 1) {
					const iNext = i + 1;
					const field1 = fields[iNext][j];
					for (let j1 = 0; j1 < field1.length; j1++) {
						const b = field1[j1];
						applyForce(a, b);
					}
				}
				if(j < fh - 1) {
					const jNext = j + 1;
					const field1 = fields[i][jNext];
					for (let j1 = 0; j1 < field1.length; j1++) {
						const b = field1[j1];
						applyForce(a, b);
					}
					if(i < fw - 1) {
						const iNext = i + 1;
						const field2 = fields[iNext][jNext];
						for (let j1 = 0; j1 < field2.length; j1++) {
							const b = field2[j1];
							applyForce(a, b);
						}
					}
				}
			}
		}
	}
}

function update() {
	for (let i = 0; i < 10; i++) logic();
	drawScene();
	frame++;
	window.requestAnimationFrame(update);
}