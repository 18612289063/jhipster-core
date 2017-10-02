const Parser = require('chevrotain').Parser;
const tokensVocabulary = require('./lexer').tokens;

// short name to reduce grammar's verbosity
const t = tokensVocabulary;


class JDLParser extends Parser {
  // Our Parser only gets initialized once, new inputs will be transferred via
  // the ".input" setter.
  constructor() {
    super([], tokensVocabulary, { recoveryEnabled: true, outputCst: true });

    const $ = this;

    // HIGHLIGHTS1: Any rule may be used as a start rule, there is no artificial limit
    // like in pegjs. This capability is useful for partial parsing, e.g.:
    // 1. Code snippets
    // 2. Incremental parsing of only the changed parts of an active Editor.
    // 3. writing Unit tests for micro code samples.
    $.RULE('prog', () => {
      $.MANY(() => {
        $.OR([
          { ALT: () => $.SUBRULE($.constantDeclaration) },
          { ALT: () => $.SUBRULE($.entityDeclaration) }
        ]);
      });
    });

    $.RULE('applicationDeclaration', () => {
      $.CONSUME(t.APPLICATION);
      $.OPTION(() => {
        $.SUBRULE($.applicationBody);
      });
    });

    $.RULE('applicationBody', () => {
      $.CONSUME(t.LCURLY);
      $.SUBRULE($.applicationConfig);
      $.CONSUME(t.RCURLY);
    });

    $.RULE('applicationConfig', () => {
      $.CONSUME(t.CONFIG);
      $.CONSUME(t.LCURLY);
      $.CONSUME(t.RCURLY);
    });

    $.RULE('constantDeclaration', () => {
      $.CONSUME(t.NAME);
      $.CONSUME(t.EQUALS);
      $.CONSUME(t.INTEGER);
    });

    $.RULE('entityDeclaration', () => {
      $.CONSUME(t.ENTITY);
      $.CONSUME(t.NAME);

      $.OPTION(() => {
        $.SUBRULE($.entityTableNameDeclaration);
      });

      // the "2" suffix is a quirk of Chevrotain, more details:
      // https://github.com/SAP/chevrotain/blob/master/docs/faq.md#-why-are-the-unique-numerical-suffixes-consume1consume2-needed-for-the-dsl-rules
      $.OPTION2(() => {
        $.SUBRULE($.entityBody);
      });
    });

    $.RULE('entityTableNameDeclaration', () => {
      $.CONSUME(t.LPAREN);
      $.CONSUME(t.NAME);
      $.CONSUME(t.RPAREN);
    });

    $.RULE('entityBody', () => {
      $.CONSUME(t.LCURLY);
      $.AT_LEAST_ONE_SEP({
        // TODO: I do not understand why the original grammar seems to have allowed
        // consecutive fields without a separating comma.
        SEP: t.COMMA,
        DEF: () => {
          $.SUBRULE($.fieldDeclaration);
        }
      });
      $.CONSUME(t.RCURLY);
    });

    $.RULE('fieldDeclaration', () => {
      $.CONSUME(t.NAME);
      $.SUBRULE($.type);
      // Short form for: "(X(,X)*)?"
      $.MANY_SEP({
        SEP: t.COMMA,
        DEF: () => {
          $.SUBRULE($.validation);
        }
      });
    });

    $.RULE('type', () => {
      $.CONSUME(t.NAME);
    });

    $.RULE('validation', () => {
      $.OR([
        { ALT: () => { $.CONSUME(t.REQUIRED); } },
        { ALT: () => { $.SUBRULE($.minMaxValidation); } },
        { ALT: () => { $.SUBRULE($.pattern); } }
      ]);
    });

    $.RULE('minMaxValidation', () => {
      // HIGHLIGHT:
      // Note that "MIN_MAX_KEYWORD" is an abstract token and could match 6 different concrete token types
      $.CONSUME(t.MIN_MAX_KEYWORD);
      $.CONSUME(t.LPAREN);
      $.OR([
        { ALT: () => { $.CONSUME(t.INTEGER); } },
        { ALT: () => { $.CONSUME(t.NAME); } }
      ]);
      $.CONSUME(t.RPAREN);
    });

    $.RULE('pattern', () => {
      $.CONSUME(t.PATTERN);
      $.CONSUME(t.LPAREN);
      // HIGHLIGHT:
      // With Chevrotain the grammar can be debugged directly by using good old fashioned breakpoints.
      // No need to to try and figure out a 10,000 lines generated file, or worse not even have that
      // if we would be use some JS combinator.
      // debugger;
      $.CONSUME(t.REGEX);
      $.CONSUME(t.RPAREN);
    });

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    Parser.performSelfAnalysis(this);
  }
}

module.exports = {
  JDLParser
};
