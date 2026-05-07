import libcst as cst
import logging
from typing import List, Optional

logger = logging.getLogger("runtime.generation.patching")

class AddImportTransformer(cst.CSTTransformer):
    """
    Safely adds an import statement (e.g. `import os` or `from x import y`) to the top of a file,
    after the docstring or existing imports.
    """
    def __init__(self, module: Optional[str] = None, names: List[str] = None, is_from: bool = False):
        self.module = module
        self.names = names or []
        self.is_from = is_from
        self.inserted = False

    def leave_Module(self, original_node: cst.Module, updated_node: cst.Module) -> cst.Module:
        if self.inserted:
            return updated_node

        if self.is_from and self.module:
            new_import = cst.ImportFrom(
                module=cst.Name(self.module),
                names=[cst.ImportAlias(name=cst.Name(n)) for n in self.names]
            )
        elif self.module:
            new_import = cst.Import(names=[cst.ImportAlias(name=cst.Name(self.module))])
        else:
            return updated_node # Not enough info
            
        new_stmt = cst.SimpleStatementLine(body=[new_import])
        
        # Try to insert after other imports, or at top
        new_body = list(updated_node.body)
        insert_idx = 0
        for i, stmt in enumerate(new_body):
            if isinstance(stmt, cst.SimpleStatementLine):
                if isinstance(stmt.body[0], (cst.Import, cst.ImportFrom)):
                    insert_idx = i + 1
                    
        new_body.insert(insert_idx, new_stmt)
        self.inserted = True
        return updated_node.with_changes(body=tuple(new_body))

class ASTPatcher:
    """
    Provides syntax-aware code modifications using libcst.
    This allows robust, deterministic injection of code (features, injectors) without regex fragility.
    """
    def add_import(self, file_path: str, module: str, names: List[str] = None, is_from: bool = False) -> bool:
        """
        Safely adds an import.
        Example: add_import('app.py', 'fastapi', ['FastAPI'], is_from=True) -> from fastapi import FastAPI
        """
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                source_code = f.read()

            source_tree = cst.parse_module(source_code)
            transformer = AddImportTransformer(module=module, names=names, is_from=is_from)
            modified_tree = source_tree.visit(transformer)
            
            if transformer.inserted:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(modified_tree.code)
                logger.info(f"Successfully added import to {file_path}")
                return True
            else:
                logger.warning(f"Could not add import to {file_path}")
                return False
                
        except Exception as e:
            logger.error(f"AST patching failed for {file_path}: {e}")
            return False
