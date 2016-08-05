import Action from '../../../src/model/action';

/** @test {Action} */
describe('Action', () => {
    /** @test {Action.COMPLETED} */
    describe('COMPLETED', () => {
        it('should exist', () => {
            Action.COMPLETED.should.equal('COMPLETED');
        });
    });

    /** @test {Action.PASS} */
    describe('PASS', () => {
        it('should exist', () => {
            Action.PASS.should.equal('PASS');
        });
    });

    /** @test {Action.SHARE} */
    describe('SHARE', () => {
        it('should exist', () => {
            Action.SHARE.should.equal('SHARE');
        });
    });

    /** @test {Action.SKIP} */
    describe('SKIP', () => {
        it('should exist', () => {
            Action.SKIP.should.equal('SKIP');
        });
    });

    /** @test {Action.SRCHCOMPL} */
    describe('SRCHCOMPL', () => {
        it('should exist', () => {
            Action.SRCHCOMPL.should.equal('SRCHCOMPL');
        });
    });

    /** @test {Action.SRCHSTART} */
    describe('SRCHSTART', () => {
        it('should exist', () => {
            Action.SRCHSTART.should.equal('SRCHSTART');
        });
    });

    /** @test {Action.START} */
    describe('START', () => {
        it('should exist', () => {
            Action.START.should.equal('START');
        });
    });

    /** @test {Action.TAPTHRU} */
    describe('TAPTHRU', () => {
        it('should exist', () => {
            Action.TAPTHRU.should.equal('TAPTHRU');
        });
    });

    /** @test {Action.THUMBUP} */
    describe('THUMBUP', () => {
        it('should exist', () => {
            Action.THUMBUP.should.equal('THUMBUP');
        });
    });

    /** @test {Action.TIMEOUT} */
    describe('TIMEOUT', () => {
        it('should exist', () => {
            Action.TIMEOUT.should.equal('TIMEOUT');
        });
    });

    /** @test {Action.getEndActions} */
    describe('getEndActions', () => {
        it('should include what is specified', () => {
            Action.getEndActions().should.contain('COMPLETED');
        });
    });

    /** @test {Action.getFlowAdvancingActions} */
    describe('getFlowAdvancingActions', () => {
        it('should include what is specified', () => {
            Action.getFlowAdvancingActions().should.contain('START');
        });
    });

    /** @test {Action.isValidAction} */
    describe('isValidAction', () => {
        it('should be true for valid actions', () => {
            Action.isValidAction('START').should.be.true;
        });

        it('should be false for invalid actions', () => {
            Action.isValidAction('BADSTART').should.be.false;
        });
    });
});
