import { GameObject } from './game-object';
import { Script } from './script';
import { IEngineState } from '../i-engine-state';

class FirstScript extends Script {}
class SecondScript extends Script {}

describe('GameObject', () => {
  describe('getScript', () => {
    it('should find an attached script by its class', () => {
      const gameObject = GameObject.create('Test', {} as IEngineState, { x: 0, y: 0 }, [
        () => new FirstScript(),
        () => new SecondScript(),
      ]);

      expect(gameObject.getScript(FirstScript)).toBeInstanceOf(FirstScript);
      expect(gameObject.getScript(SecondScript)).toBeInstanceOf(SecondScript);
    });

    it('should return undefined when no script of that class is attached', () => {
      const gameObject = GameObject.create('Test', {} as IEngineState, { x: 0, y: 0 }, [() => new FirstScript()]);

      expect(gameObject.getScript(SecondScript)).toBeUndefined();
    });
  });

  describe('setPosition', () => {
    it('should mutate the position exposed by the position getter', () => {
      const gameObject = GameObject.create('Test', {} as IEngineState, { x: 0, y: 0 }, []);

      gameObject.setPosition(5, 9);

      expect(gameObject.position).toEqual({ x: 5, y: 9 });
    });
  });
});
