/**
 * Category Tree Manipulation Helpers
 */

import { ReactNode } from "react";
import type { DataNode } from "antd/es/tree";
import type { ICategoryResponse } from "@/interfaces/category/category.response.interface";

export interface CategoryTreeNode {
  title: string;
  key: React.Key;
  children?: CategoryTreeNode[];
}

export const transformCategoryToTreeData = (
  categories: ICategoryResponse[]
): CategoryTreeNode[] => {
  return categories.map((cat) => {
    const nestedCategories = cat.children || cat.subCategories;
    
    return {
      title: cat.name,
      key: cat.id,
      children:
        nestedCategories && nestedCategories.length > 0
          ? transformCategoryToTreeData(nestedCategories)
          : undefined,
    } as CategoryTreeNode;
  });
};

export const filterTreeData = (
  data: DataNode[],
  searchText: string
): DataNode[] => {
  if (!searchText) return data;

  const filtered: DataNode[] = [];

  for (const node of data) {
    const title = String(node.title || "");
    const matches = title.toLowerCase().includes(searchText.toLowerCase());
    const filteredChildren = node.children
      ? filterTreeData(node.children, searchText)
      : [];

    if (matches || filteredChildren.length > 0) {
      filtered.push({
        ...node,
        children:
          filteredChildren.length > 0 ? filteredChildren : node.children,
      });
    }
  }

  return filtered;
};

export const highlightText = (
  text: string,
  searchText: string
): ReactNode => {
  if (!searchText) return text;

  const parts = text.split(new RegExp(`(${searchText})`, "gi"));

  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === searchText.toLowerCase() ? (
          <span key={index} className="bg-yellow-200">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};


export const getHighlightedTreeData = (
  data: DataNode[],
  searchText: string
): DataNode[] => {
  return data.map((node) => ({
    ...node,
    title: highlightText(String(node.title), searchText),
    children: node.children
      ? getHighlightedTreeData(node.children, searchText)
      : undefined,
  }));
};


export const getAllKeys = (data: DataNode[]): React.Key[] => {
  const keys: React.Key[] = [];

  const traverse = (nodes: DataNode[]) => {
    nodes.forEach((node) => {
      keys.push(node.key);
      if (node.children) {
        traverse(node.children);
      }
    });
  };

  traverse(data);
  return keys;
};


export const getParentKeysOfSelectedCategories = (
  selectedKeys: React.Key[],
  treeData: DataNode[]
): React.Key[] => {
  const parentKeys = new Set<React.Key>();
  const selectedSet = new Set(selectedKeys);

  const findParentKeys = (
    nodes: DataNode[],
    currentPath: React.Key[] = []
  ) => {
    nodes.forEach((node) => {
      const isSelected = selectedSet.has(node.key);

      if (isSelected) {
        currentPath.forEach((key) => parentKeys.add(key));
        return;
      }

      if (node.children && node.children.length > 0) {
        findParentKeys(node.children, [...currentPath, node.key]);
      }
    });
  };

  findParentKeys(treeData);
  return Array.from(parentKeys);
};


export const getSelectedCategoryNamesWithKeys = (
  keys: React.Key[],
  treeData: DataNode[]
): Array<{ id?: React.Key; name: string; keys: React.Key[] }> => {
  const result: Array<{ id?: React.Key; name: string; keys: React.Key[] }> = [];

  const findNames = (data: DataNode[]) => {
    data.forEach((node) => {
      const isSelected = keys.includes(node.key);
      const hasChildren = node.children && node.children.length > 0;

      if (hasChildren && node.children) {
        const getAllChildKeys = (children: DataNode[]): React.Key[] => {
          const childKeys: React.Key[] = [];
          children.forEach((child) => {
            childKeys.push(child.key);
            if (child.children && child.children.length > 0) {
              childKeys.push(...getAllChildKeys(child.children));
            }
          });
          return childKeys;
        };

        const allChildKeys = getAllChildKeys(node.children);
        const allChildrenSelected = allChildKeys.every((key) =>
          keys.includes(key)
        );

        if (allChildrenSelected && isSelected) {
          result.push({
            id: node.key,
            name: String(node.title),
            keys: [node.key, ...allChildKeys],
          });
        } else {
          findNames(node.children);
        }
      } else {
        if (isSelected) {
          result.push({ name: String(node.title), keys: [node.key] });
        }
      }
    });
  };

  findNames(treeData);
  return result;
};
