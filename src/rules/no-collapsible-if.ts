/*
 * eslint-plugin-sonarjs
 * Copyright (C) 2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
// https://jira.sonarsource.com/browse/RSPEC-1066

import { Rule } from "eslint";
import * as estree from "estree";
import { isIfStatement, isBlockStatement } from "../utils/nodes";
import { report, issueLocation } from "../utils/locations";

const rule: Rule.RuleModule = {
  meta: {
    schema: [
      {
        // internal parameter
        enum: ["sonar-runtime"],
      },
    ],
  },
  create(context: Rule.RuleContext) {
    return {
      IfStatement(node: estree.Node) {
        let { consequent } = node as estree.IfStatement;
        if (isBlockStatement(consequent) && consequent.body.length === 1) {
          consequent = consequent.body[0];
        }
        if (isIfStatementWithoutElse(node) && isIfStatementWithoutElse(consequent)) {
          const ifKeyword = context.getSourceCode().getFirstToken(consequent);
          const enclosingIfKeyword = context.getSourceCode().getFirstToken(node);
          if (ifKeyword && enclosingIfKeyword) {
            report(
              context,
              {
                message: `Merge this if statement with the nested one.`,
                loc: enclosingIfKeyword.loc,
              },
              [issueLocation(ifKeyword.loc, ifKeyword.loc, `Nested "if" statement.`)],
            );
          }
        }
      },
    };

    function isIfStatementWithoutElse(node: estree.Node): node is estree.IfStatement {
      return isIfStatement(node) && !node.alternate;
    }
  },
};

export = rule;
