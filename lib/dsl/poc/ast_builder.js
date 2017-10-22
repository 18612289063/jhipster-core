const JDLParser = require('./parser').JDLParser;
const _ = require('lodash');


function buildAst(cst) {
  // eslint-disable-next-line no-use-before-define
  const astBuilderVisitor = new JDLAstBuilderVisitor();
  return astBuilderVisitor.visit(cst);
}

const BaseJDLCSTVisitor = new JDLParser().getBaseCstVisitorConstructor();

/**
 * Note that the logic here assumes the input CST is valid.
 * To make this work with partially formed CST created during automatic error recovery
 * would require refactoring for greater robustness.
 * Meaning we can never assume at least one element exists in a ctx child array
 * e.g:
 * 1. ctx.NAME[0].image --> ctx.NAME[0] ? ctx.NAME[0].image : "???"
 */
class JDLAstBuilderVisitor extends BaseJDLCSTVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  prog(ctx) {
    return {
      applications: _.map(ctx.applicationDeclaration, element => this.visit(element)),
      entities: _.map(ctx.entityDeclaration, element => this.visit(element)),
      constants: _.map(ctx.constantDeclaration, element => this.visit(element))
    };
  }

  applicationDeclaration(ctx) {
    return {
      config: this.visit(ctx.applicationBody).config
    };
  }

  applicationBody(ctx) {
    return {
      config: this.visit(ctx.applicationConfig)
    };
  }

  applicationConfig(ctx) {
    return {
      baseName: this.visit(ctx.applicationBaseName),
      packageName: this.visit(ctx.applicationPackageName),
      authenticationType: this.visit(ctx.applicationAuthenticationType),
      hibernateCache: this.visit(ctx.applicationHibernateCache),
      databaseType: this.visit(ctx.applicationDatabaseType),
      devDatabaseType: this.visit(ctx.applicationDevDatabaseType),
      prodDatabaseType: this.visit(ctx.applicationProdDatabaseType),
      webSocket: this.visit(ctx.applicationWebSocket)
    };
  }

  applicationBaseName(ctx) {
    return getGenericName(ctx);
  }

  applicationPackageName(ctx) {
    return getGenericName(ctx);
  }

  applicationAuthenticationType(ctx) {
    return getGenericName(ctx);
  }

  applicationHibernateCache(ctx) {
    return getGenericName(ctx);
  }

  applicationDatabaseType(ctx) {
    return getGenericName(ctx);
  }

  applicationDevDatabaseType(ctx) {
    return getGenericName(ctx);
  }

  applicationProdDatabaseType(ctx) {
    return getGenericName(ctx);
  }

  applicationWebSocket(ctx) {
    return getGenericName(ctx);
  }

  constantDeclaration(ctx) {
    return {
      name: getGenericName(ctx),
      value: parseInt(ctx.INTEGER[0].image, 10)
    };
  }

  entityDeclaration(ctx) {
    return {
      name: getGenericName(ctx),
      // ctx.entityTableNameDeclaration is optional which means
      // either an empty array or an array of a single element
      // the "this.visit" API will handle this transparently and return
      // undefined in the case of empty array.
      tableName: this.visit(ctx.entityTableNameDeclaration),
      fields: this.visit(ctx.entityBody)
    };
  }

  entityTableNameDeclaration(ctx) {
    return getGenericName(ctx);
  }

  entityBody(ctx) {
    return _.map(ctx.fieldDeclaration, element => this.visit(element));
  }

  fieldDeclaration(ctx) {
    return {
      name: getGenericName(ctx),
      // ctx.type is an array with a single item.
      // in that case:
      // this.visit(ctx.type) is equivalent to this.visit(ctx.type[0])
      type: this.visit(ctx.fieldType),
      validations: _.map(ctx.validation, element => this.visit(element))
    };
  }

  fieldType(ctx) {
    return getGenericName(ctx);
  }

  validation(ctx) {
    // only one of these alternatives can exist at the same time.
    if (!_.isEmpty(ctx.REQUIRED)) {
      return {
        validationType: 'required'
      };
    } else if (!_.isEmpty(ctx.minMaxValidation)) {
      return this.visit(ctx.minMaxValidation);
    }
    return this.visit(ctx.pattern);
  }

  minMaxValidation(ctx) {
    return {
      validationType: ctx.MIN_MAX_KEYWORD[0].image,
      limit: _.isEmpty(ctx.NAME) ?
        parseInt(ctx.INTEGER[0].image, 10) :
        getGenericName(ctx)
    };
  }

  pattern(ctx) {
    return {
      validationType: 'pattern',
      pattern: ctx.REGEX[0].image
    };
  }

  relationDeclaration(ctx) {
    // TODO: implement
  }

  relationshipType(ctx) {
    // TODO: implement
  }

  relationshipBody(ctx) {
    // TODO: implement
  }

  relationshipSide(ctx) {
    // TODO: implement
  }

  enumDeclaration(ctx) {
    // TODO: implement
  }

  enumPropList(ctx) {
    // TODO: implement
  }

  dtoDeclaration(ctx) {
    // TODO: implement
  }

  entityList(ctx) {
    // TODO: implement
  }

  method(ctx) {
    // TODO: implement
  }

  exclusion(ctx) {
    // TODO: implement
  }

  paginationDeclaration(ctx) {
    // TODO: implement
  }

  serviceDeclaration(ctx) {
    // TODO: implement
  }

  microserviceDeclaration1(ctx) {
    // TODO: implement
  }

  searchEngineDeclaration(ctx) {
    // TODO: implement
  }

  noClientDeclaration(ctx) {
    // TODO: implement
  }

  noServerDeclaration(ctx) {
    // TODO: implement
  }

  noFluentMethod(ctx) {
    // TODO: implement
  }

  filterDeclaration(ctx) {
    // TODO: implement
  }

  filterDef(ctx) {
    // TODO: implement
  }

  angularSuffixDeclaration(ctx) {
    // TODO: implement
  }

  comment(ctx) {
    // TODO: implement
  }
}

function getGenericName(context) {
  return context.NAME[0].image;
}

module.exports = {
  buildAst
};
