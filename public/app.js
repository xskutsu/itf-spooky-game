void !(function () {
    class Vector2 {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    class Entity {
        constructor(position, radius) {
            this.sleeping = false;
            this.sleepTicker = 0;
            this.position = new Vector2(position.x, position.y);
            this.velocity = new Vector2(0, 0);
            this.friction = 0.9;
            this.mass = 1;
            this.isStatic = false;
            this.radius = radius;
            this.aabb = {
                minX: this.position.x - this.radius,
                minY: this.position.y - this.radius,
                maxX: this.position.x + this.radius,
                maxY: this.position.y + this.radius
            };
        }

        wakeUp() {
            this.sleeping = false;
            this.sleepTicker = 0;
        }

        moveBy(x, y) {
            this.position.x += x;
            this.position.y += y;
            this.aabb.minX += x;
            this.aabb.minY += y;
            this.aabb.maxX += x;
            this.aabb.maxY += y;
        }

        moveTo(x, y) {
            this.moveBy(x - this.position.x, y - this.position.y);
        }

        tick() {
            if (!this.sleeping) {
                this.velocity.x *= this.friction;
                this.velocity.y *= this.friction;
                this.position.x += this.velocity.x;
                this.position.y += this.velocity.y;
                if (this.velocity.x <= 0.01 && this.velocity.y <= 0.01) {
                    if (this.sleepTicker === 50) {
                        this.sleeping = true;
                    } else {
                        this.sleepTicker++;
                    }
                } else {
                    this.sleepTicker = 0;
                }
            }
        }
    }

    class System {
        constructor(bounds) {
            this.entities = new Map();
            this.bounds = {
                minX: bounds.minX,
                minY: bounds.minY,
                maxX: bounds.maxX,
                maxY: bounds.maxY
            };
            this.hash = new SpatialHashGrid(64, this);
        }

        resolveCollision(entity1, entity2) {
            
        }

        tick() {

        }
    }

    class SpatialHashGrid {
        constructor(cellSize, system) {
            this.cellSize = cellSize;
            this.system = system;
            this.cells = new Map();
        }

        hash(x, y) {
            return x + y * 0xB504;
        }

        insert(minX, minY, maxX, maxY, id) {
            const startX = minX >> this.cellSize;
            const startY = minY >> this.cellSize;
            const endX = maxX >> this.cellSize;
            const endY = maxY >> this.cellSize;
            for (let x = startX; x <= endX; x++) {
                for (let y = startY; y <= endY; y++) {
                    const key = this.hash(x, y);
                    if (this.cells.has(key)) {
                        this.cells.get(key).push(id);
                    } else {
                        this.cells.set(key, [id]);
                    }
                }
            }
        }

        collisions() {
            for (const cell of this.cells.values()) {
                const length = cell.length;
                if (length < 2) {
                    continue;
                }

                for (let i = 0; i < length; i++) {
                    const entity1 = this.system.entities.get(cell[i]);
                    for (let j = i + 1; j < length; j++) {
                        const entity2 = this.system.entities.get(cell[j]);
                        if (!entity1.sleeping || !entity2.sleeping) {
                            this.system.resolveCollision(entity1, entity2);
                        }
                    }
                }
            }
        }

        queryArea(minX, minY, maxX, maxY) {
            const output = [];
            return output;
        }

        clear() {
            this.cells.clear();
        }
    }

    const canvasElement = document.createElement("canvas");

    function resizeEvent() {
        const aspectRatio = 4 / 3;
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;
        const fitsVertically = width / height > aspectRatio;
        canvasElement.width = fitsVertically ? height * aspectRatio : width;
        canvasElement.height = fitsVertically ? height : width / aspectRatio;
    }

    window.addEventListener("resize", () => resizeEvent());
    resizeEvent();

    const ctx = canvasElement.getContext("2d", { alpha: false, willReadFrequently: false, desynchronized: true });
    ctx.imageSmoothingEnabled = false;

    function animationLoop() {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

        requestAnimationFrame(animationLoop);
    }

    document.body.appendChild(canvasElement);
    animationLoop();
})();