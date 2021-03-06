/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const JDLValidation = require('../../../lib/core/jdl_validation');
const VALIDATIONS = require('../../../lib/core/jhipster/validations').VALIDATIONS;

describe('JDLValidation', () => {
  describe('::new', () => {
    describe('when not passing any argument', () => {
      it('defaults on the \'required\' validation', () => {
        const validation = new JDLValidation();
        expect(validation.name).to.eq('required');
        expect(validation.value).to.eq('');
      });
    });
    describe('when passing arguments', () => {
      it('uses them', () => {
        const validation = new JDLValidation({
          name: 'min',
          value: 42
        });
        expect(validation.name).to.eq('min');
        expect(validation.value).to.eq(42);
      });
    });
  });
  describe('::isValid', () => {
    describe('when checking the validity of an invalid object', () => {
      describe('because it is nil or invalid', () => {
        it('returns false', () => {
          expect(JDLValidation.isValid(null)).to.be.false;
          expect(JDLValidation.isValid(undefined)).to.be.false;
        });
      });
      describe('without a name attribute', () => {
        it('returns false', () => {
          expect(JDLValidation.isValid({})).to.be.false;
        });
      });
      describe('without a valid name attribute', () => {
        it('returns false', () => {
          expect(JDLValidation.isValid({ name: 'something' })).to.be.false;
        });
      });
      describe('with a valid name but an invalid value', () => {
        it('returns false', () => {
          expect(JDLValidation.isValid({ name: VALIDATIONS.MIN })).to.be.false;
        });
      });
    });
    describe('when checking the validity of a valid object', () => {
      it('returns true', () => {
        expect(JDLValidation.isValid({ name: VALIDATIONS.REQUIRED })).to.be.true;
        expect(JDLValidation.isValid({
          name: VALIDATIONS.MIN,
          value: 42
        })).to.be.true;
      });
    });
  });
  describe('#toString', () => {
    describe('with no value', () => {
      it('stringifies its content', () => {
        const validation = new JDLValidation();
        expect(validation.toString()).to.eq('required');
      });
    });
    describe('with a value', () => {
      it('stringifies its content', () => {
        const args = {
          name: 'min',
          value: 42
        };
        const validation = new JDLValidation(args);
        expect(validation.toString()).to.eq(`${args.name}(${args.value})`);
      });
    });
  });
});
