import Abstract from './abstract.js';
import { Vector} from './util/dynamical_vector.js';

export default class PointMass extends Abstract{
    constructor(){
        super();

        this._position      =  new Vector(0,0);
        this._old_position  =  new Vector(0,0);
        this._acceleration  =  new Vector(0,0,0);
        this._mass          =  1;

        this._is_static     =  false;
        this._onCollision   =  ()=>{};
    }

    static create(x=0, y=0){
        const position = (x instanceof Vector) ? x : new Vector(x, y) 
        return new PointMass()
            .setPosition(position)
            .setOldPosition(position);
    }

    setMass(mass){
        this._mass = mass;
        return this;
    }
    static(){
        this._is_static = true;
        return this;
    }

    setPosition(position){
        if(this._is_static) return this;

        this._position.assign(position);

        return this;
    }
    setOldPosition(old_position){
        if(this._is_static) return this;

        this._old_position.assign(old_position);

        return this;
    }
    setVelocity(velocity){
        if(this._is_static) return this;

        this._old_position.assign(this._position.subtract(velocity));

        return this;
    }
    setOnCollision(onCollision_callback){
        this._onCollision = onCollision_callback;
        return this;
    }
    addVelocity(velocity){
        if(this._is_static) return this;

        this._old_position.assign(this._old_position.subtract(velocity));

        return this;
    }
    applyForce(force){
        if(this._is_static) return this;
        
        this._acceleration = this._acceleration.add(
            force.divide(this._mass)
        );

        return this;
    }

    applyGravity(gravity=new Vector(0, 9.8)){
        if(this._is_static) return this;
        
        this.applyForce(
            Vector.multiply(
                gravity,
                this.mass
            )
        );

        return this;
    }
    applyCollision(
        other, 
        contact_point, 
        normal, 
        friction_constant
    ){
        this._onCollision(other);

        if(this._is_static) return this;

        this._resolveCollision(contact_point, normal);
        this._resolveFriction(normal, friction_constant);

        return this;
    }

    applyDistanceConstraint(new_position){
        if(this._is_static) return;

        this._resolveDistanceConstraint(new_position);
    }
    _resolveCollision(contact_point, normal){
        this._old_position.assign(
            this._position
            .subtract(this._old_position)
            .reflect(normal)
            .invert()
            .add(contact_point)
        );
        this._position.assign(contact_point);
    }
    _resolveFriction(normal, friction_constant){

        const v = this._position.subtract(this._old_position);

        //p is a normalized vector pointing parrallel to the surface
        const p = new Vector(normal.y, -normal.x);
        const opposing_v = p.multiply(v.dot(p))
            .invert()
            .multiply(friction_constant);

        this.addVelocity(opposing_v );
    }
    _resolveDistanceConstraint(new_position){
        this._position.assign(new_position);
    }

    updatePosition(delta_time=0.25){
        if(this._is_static) return;

        const velocity = this._position.subtract(this._old_position);
        
        this._old_position.assign(this._position);

        this._position = this._position
            .add(velocity)
            .add(this._acceleration.multiply(delta_time * delta_time));

        this._acceleration.x = 0;
        this._acceleration.y = 0;
    }

    draw(radius=5){
        const circle = this.graphic.renderer.circle({
            position: this._position,
            radius: radius,
        });

        this.graphic.applyStyle(circle);

        return circle;
    }

    get position(){ return this._position.clone(); }
    get old_position(){ return this._old_position.clone(); }
    get mass(){ return this._mass; }
    get acceleration(){ return this._acceleration.clone(); }
    isStatic(){ return this._is_static; }
}
