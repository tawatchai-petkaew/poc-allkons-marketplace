// ***********
// Interface
// ***********

interface GetAllAttributes {
  parentRepoClass: any;
  parentDtoClass: any;
  childRepoClass: any;
  parentKeyForGetChild: string;
  locale: any;
  parents: any;
  meta: any;
  relations: string[];
  nestedParentChildWithTranslation: any[];
}

interface CreateAttributes {
  patentDto: object;
  childDto: object;
  parentKeyForUpdateChild: string;
  parentRepoClass: any;
  parentDtoClass: any;
  childRepoClass: any;
  childDtoClass: any;
}

interface GetAttributes {
  id: number;
  parentRepoClass: any;
  parentDtoClass: any;
  childRepoClass: any;
  parentKeyForGetChild: string;
  locale: any;
  parent: any;
  relations: string[];
  nestedParentChildWithTranslation: any[];
}

interface UpdateAttributes {
  parent: any;
  parentEntity: any;
  patentDto: any;
  childDto: object;
  parentKeyForUpdateChild: string;
  parentRepoClass: any;
  parentDtoClass: any;
  childRepoClass: any;
  childDtoClass: any;
  relations: string[];
}

interface DeleteAttributes {
  id: number;
  parentRepoClass: any;
  childRepoClass: any;
  parentKeyForGetChild: string;
  relations: string[];
}

// ***********
// Functions
// ***********

const getAllWithTranslationWithData = async (attributes: GetAllAttributes) => {
  const {
    parentRepoClass,
    parentDtoClass,
    childRepoClass,
    parentKeyForGetChild,
    locale,
    parents,
    meta,
    relations,
    nestedParentChildWithTranslation = [],
  } = attributes;

  const result = await parents.map(async (e) => {
    const child = await findTranslateOneByParentIdWithData(
      e[`${parentKeyForGetChild}Translations`],
      locale,
    );

    if (nestedParentChildWithTranslation.length > 0) {
      const nestedTranslation = await nestedParentChildWithTranslation.map(
        async (obj) => {
          if (e[obj.parentKey]?.id) {
            return await findTranslateOneByParentIdWithData(
              e[`${obj.parentKey}Translations`],
              locale,
            );
          }
        },
      );

      const nestedResponse = await Promise.all(nestedTranslation).then(
        (values) => {
          return values;
        },
      );

      return parentDtoClass.fromEntity(e, child, nestedResponse);
    } else {
      return parentDtoClass.fromEntity(e, child);
    }
  });

  const response = await Promise.all(result).then((values) => {
    return values;
  });

  return await {
    data: response,
    meta: meta,
  };
};

const getAllWithTranslation = async (attributes: GetAllAttributes) => {
  const {
    parentRepoClass,
    parentDtoClass,
    childRepoClass,
    parentKeyForGetChild,
    locale,
    parents,
    meta,
    relations,
    nestedParentChildWithTranslation = [],
  } = attributes;

  const result = await parents.map(async (e) => {
    const child = await findTranslateOneByParentId(
      parentRepoClass,
      childRepoClass,
      e.id,
      parentKeyForGetChild,
      locale,
      relations,
    );

    if (nestedParentChildWithTranslation.length > 0) {
      const nestedTranslation = await nestedParentChildWithTranslation.map(
        async (obj) => {
          if (e[obj.parentKey]?.id) {
            return await findTranslateOneByParentId(
              obj.parentRepoClass,
              obj.childRepoClass,
              e[obj.parentKey].id,
              obj.parentKey,
              locale,
              relations,
            );
          }
        },
      );

      const nestedResponse = await Promise.all(nestedTranslation).then(
        (values) => {
          return values;
        },
      );

      return parentDtoClass.fromEntity(e, child, nestedResponse);
    } else {
      return parentDtoClass.fromEntity(e, child);
    }
  });

  const response = await Promise.all(result).then((values) => {
    return values;
  });

  return await {
    data: response,
    meta: meta,
  };
};

const createWithTranslation = (attributes: CreateAttributes) => {
  const {
    patentDto,
    childDto,
    parentKeyForUpdateChild,
    parentRepoClass,
    parentDtoClass,
    childRepoClass,
    childDtoClass,
  } = attributes;

  return parentRepoClass
    .save(parentDtoClass.toEntity(patentDto))
    .then(async (e) => {
      childDto[parentKeyForUpdateChild] = e;

      const translation = await childRepoClass
        .save(childDtoClass.toEntity(childDto))
        .then((e) => e);

      return parentDtoClass.fromEntity(e, translation);
    });
};

const getByIdWithTranslation = async (attributes: GetAttributes) => {
  const {
    id,
    parentRepoClass,
    parentDtoClass,
    childRepoClass,
    parentKeyForGetChild,
    locale,
    parent,
    relations,
    nestedParentChildWithTranslation = [],
  } = attributes;

  const child = await findTranslateOneByParentId(
    parentRepoClass,
    childRepoClass,
    id,
    parentKeyForGetChild,
    locale,
    relations,
  );

  if (nestedParentChildWithTranslation.length > 0) {
    const nestedTranslation = await nestedParentChildWithTranslation.map(
      async (obj) => {
        if (parent[obj.parentKey]?.id) {
          return await findTranslateOneByParentId(
            obj.parentRepoClass,
            obj.childRepoClass,
            parent[obj.parentKey].id,
            obj.parentKey,
            locale,
            relations,
          );
        }
      },
    );

    const nestedResponse = await Promise.all(nestedTranslation).then(
      (values) => {
        return values;
      },
    );

    return parentDtoClass.fromEntity(parent, child, nestedResponse);
  } else {
    return parentDtoClass.fromEntity(parent, child);
  }
};

const updateWithTranslation = (attributes: UpdateAttributes) => {
  const {
    parent,
    parentEntity,
    patentDto,
    childDto,
    parentKeyForUpdateChild,
    parentRepoClass,
    parentDtoClass,
    childRepoClass,
    childDtoClass,
    relations,
  } = attributes;

  return parentRepoClass
    .save(Object.assign(parent, parentEntity))
    .then(async (e) => {
      childDto[parentKeyForUpdateChild] = e;
      const getChild = await findTranslateOneByParentId(
        parentRepoClass,
        childRepoClass,
        e.id,
        parentKeyForUpdateChild,
        patentDto && patentDto.locale ? patentDto.locale : 'th',
        relations,
      );
      const ChildDto = childDtoClass.toEntity(childDto);

      if (getChild) {
        const child = await childRepoClass
          .save(Object.assign(getChild, ChildDto))
          .then((e) => e);

        return parentDtoClass.fromEntity(e, child);
      } else {
        const child = await childRepoClass.save(ChildDto).then((e) => e);

        return parentDtoClass.fromEntity(e, child);
      }
    });
};

const deleteWithTranslation = async (attributes: DeleteAttributes) => {
  const {
    id,
    parentRepoClass,
    childRepoClass,
    parentKeyForGetChild,
    relations,
  } = attributes;

  const child = await findTranslateByParentId(
    parentRepoClass,
    childRepoClass,
    id,
    parentKeyForGetChild,
    relations,
  );

  child.forEach((e) => {
    childRepoClass.softDelete(e.id);
  });

  return parentRepoClass.softDelete(id);
};

// ***********
// Helpers
// ***********

const findById = async (
  parentRepoClass: any,
  id: number,
  relations: string[],
) => {
  return await parentRepoClass.findOne({
    where: { id: id },
    relations: relations,
  });
};

const findTranslateOneByParentIdWithData = async (data: any, locale: any) => {
  if (data) {
    const selectedTranslate = data.find((d) => d.locale === locale);

    return await selectedTranslate;
  }

  return null;
};

const findTranslateOneByParentId = async (
  _parentRepoClass: any,
  childRepoClass: any,
  parentId: number,
  parentKey: string,
  locale: any,
  _relations,
) => {
  // const parent = await findById(parentRepoClass, parentId, relations);
  const queryParams = {
    locale: locale,
  };
  queryParams[parentKey] = { id: parentId };

  return await childRepoClass.findOne({ where: queryParams });
};

const findTranslateByParentId = async (
  _parentRepoClass: any,
  childRepoClass: any,
  parentId: number,
  parentKey: string,
  _relations,
) => {
  // const parent = await findById(parentRepoClass, parentId, relations);
  const queryParams = {};
  queryParams[parentKey] = { id: parentId };

  return await childRepoClass.find({ where: queryParams });
};

// ***********
// Export
// ***********

export {
  getAllWithTranslation,
  createWithTranslation,
  getByIdWithTranslation,
  updateWithTranslation,
  deleteWithTranslation,
  getAllWithTranslationWithData,
};
